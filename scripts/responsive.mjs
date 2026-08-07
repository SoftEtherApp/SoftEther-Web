#!/usr/bin/env node
// Responsive hardening check — drives the locally cached headless Chromium
// over raw CDP (no npm deps; Node's built-in WebSocket).
//
// Usage:
//   node scripts/responsive.mjs [baseUrl] [viewportCsv]
// Example:
//   node scripts/responsive.mjs http://127.0.0.1:8791 \
//     "375x800,390x844,480x960,768x1024,1024x768,1440x900"
//
// Probes every route x viewport for horizontal overflow (elements spilling
// past the viewport) and JS console errors. Exits non-zero when any are
// found, so it can gate CI once a server is up.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://127.0.0.1:8791";
const VIEWPORTS = (process.argv[3] ?? "375,800 390,844 480,960 768,1024 1024,768 1440,900")
  .split(/\s+/)
  .map((v) => v.split(",").map(Number));

const ROUTES = ["/", "/library", "/privacy", "/security", "/changelog", "/nope"];

/* ── locate the cached headless Chromium ── */

function findChromium() {
  const cache = `${homestd()}/.cache/ms-playwright`;
  const candidates = [];
  for (const dir of ["chromium_headless_shell-1208", "chromium-1208"]) {
    candidates.push(`${cache}/${dir}/chrome-headless-shell-linux64/chrome-headless-shell`);
    candidates.push(`${cache}/${dir}/chrome-linux/chrome`);
  }
  for (const c of candidates) if (existsSync(c)) return c;
  throw new Error("No cached headless Chromium found under ~/.cache/ms-playwright");
}
function homestd() {
  return process.env.HOME || "/root";
}

/* ── tiny CDP client over WebSocket ── */

class CDP {
	constructor(ws) {
		this.ws = ws;
		this.id = 0;
		this.pending = new Map();
		this.sessionListeners = [];
		ws.addEventListener("message", (ev) => {
			const msg = JSON.parse(ev.data);
			if (msg.id !== undefined && this.pending.has(msg.id)) {
				const { resolve, reject } = this.pending.get(msg.id);
				this.pending.delete(msg.id);
				if (msg.error) reject(new Error(msg.error.message));
				else resolve(msg.result);
				return;
			}
			// Flattened sessions (Target.attachToTarget {flatten:true}):
			// session messages arrive as TOP-LEVEL messages carrying sessionId
			// (Runtime.consoleAPICalled, Runtime.exceptionThrown, ...).
			if (msg.sessionId) {
				for (const l of this.sessionListeners) l(msg.sessionId, msg);
				return;
			}
			// Legacy wrapper form.
			if (msg.method === "Target.receivedMessageFromTarget" && msg.params.sessionId) {
				const inner = JSON.parse(msg.params.message);
				for (const l of this.sessionListeners) l(msg.params.sessionId, inner);
			}
		});
	}
	send(method, params = {}, sessionId) {
		const id = ++this.id;
		const payload = JSON.stringify(
			sessionId ? { id, method, params, sessionId } : { id, method, params },
		);
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.ws.send(payload);
		});
	}
	onSessionMessage(fn) {
		this.sessionListeners.push(fn);
	}
}

/* ── launch browser ── */

const userData = mkdtempSync(`${tmpdir()}/se-responsive-`);
const bin = findChromium();
const proc = spawn(bin, [
  "--headless", "--no-sandbox", "--disable-gpu",
  `--user-data-dir=${userData}`,
  "--remote-debugging-port=0", "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });

const wsUrl = await new Promise((resolve, reject) => {
  let buf = "";
  const timer = setTimeout(() => reject(new Error("timeout waiting for DevTools")), 15000);
  proc.stderr.on("data", (d) => {
    buf += d.toString();
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) { clearTimeout(timer); resolve(m[1]); }
  });
  proc.on("exit", (c) => { clearTimeout(timer); reject(new Error(`browser exited ${c}`)); });
});

const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", rej); });
const cdp = new CDP(ws);

/* ── helpers ── */

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function evaluate(sessionId, expression) {
  const r = await cdp.send("Runtime.evaluate", {
    expression, returnByValue: true, awaitPromise: true,
  }, sessionId);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
}

const PROBE = `(() => {
  const vw = window.innerWidth;
  const doc = document.documentElement;
  const offenders = [...document.querySelectorAll('body *')]
    .map((el) => { const r = el.getBoundingClientRect(); return { el, r }; })
    .filter(({ r }) => r.right > vw + 1 || r.left < -1)
    .slice(0, 8)
    .map(({ el, r }) => ({
      tag: el.tagName,
      cls: String(el.className && (el.className.baseVal !== undefined ? el.className.baseVal : el.className)).slice(0, 60),
      left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
    }));
  return { vw, scrollW: doc.scrollWidth, overflow: doc.scrollWidth > vw + 1, offenders, title: document.title };
})()`;

// Set SCREENSHOT_DIR=/tmp/shots to also dump full-page PNGs of each route at
// the first viewport (visual evidence for the report).
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR ? `${process.env.SCREENSHOT_DIR}`.replace(/\/$/, "") : null;
if (SCREENSHOT_DIR) mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Self-test: prove console-error detection actually fires. Fire a marker
// error in a page session and require the listener to capture it — if the
// CDP event plumbing regresses, the suite fails loudly instead of passing
// vacuously.
const SELF_TEST_MARKER = "__RESPONSIVE_SELFTEST__";

let failures = 0;
const consoleErrors = [];

function cdpConsoleError(e) {
	consoleErrors.push(e);
}

/* ── run matrix ── */

for (const [vw, vh] of VIEWPORTS) {
	const target = await cdp.send("Target.createTarget", { url: "about:blank" });
	const { sessionId } = await cdp.send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
	await cdp.send("Page.enable", {}, sessionId);
	await cdp.send("Runtime.enable", {}, sessionId);
	cdp.onSessionMessage((sid, inner) => {
		if (sid !== sessionId) return;
		if (inner.method === "Runtime.consoleAPICalled" && inner.params.type === "error") {
			cdpConsoleError(`[console.error] ${inner.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 200)}`);
		}
		if (inner.method === "Runtime.exceptionThrown") {
			cdpConsoleError(`[pageerror] ${inner.params.exceptionDetails.text}`);
		}
	});
	await cdp.send("Emulation.setDeviceMetricsOverride", { width: vw, height: vh, deviceScaleFactor: 1, mobile: vw < 640 }, sessionId);

	for (const route of ROUTES) {
		await cdp.send("Page.navigate", { url: `${BASE}${route}` }, sessionId);
		// wait for load + a beat for client routing/effects
		for (let i = 0; i < 50; i++) {
			const st = await evaluate(sessionId, "document.readyState");
			if (st === "complete") break;
			await sleep(100);
		}
		await sleep(450);
		const res = await evaluate(sessionId, PROBE);
		if (SCREENSHOT_DIR && vw === VIEWPORTS[0][0] && vh === VIEWPORTS[0][1]) {
			const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
			const name = `${route.replace(/[^a-z0-9]/gi, "_") || "root"}__${vw}x${vh}.png`;
			writeFileSync(`${SCREENSHOT_DIR}/${name}`, Buffer.from(shot.data, "base64"));
		}
		if (vw === VIEWPORTS[0][0] && vh === VIEWPORTS[0][1]) {
			console.log(`route ${route} -> title: ${res.title}`);
		}
		if (res.overflow) {
			failures++;
			console.log(`OVERFLOW ${vw}x${vh} ${route}: scrollW=${res.scrollW} vw=${res.vw}`);
			for (const o of res.offenders) {
				console.log(`   ${o.tag}.${o.cls} left=${o.left} right=${o.right} w=${o.w}`);
			}
		}
	}

	// Self-test once per targeted page at the END (last viewport): proves the
	// console-error listener path delivers events.
	if (vw === VIEWPORTS.at(-1)[0] && vh === VIEWPORTS.at(-1)[1]) {
		await evaluate(sessionId, `console.error("${SELF_TEST_MARKER}")`);
		await sleep(400);
		const gotMarker = consoleErrors.some((e) => e.includes(SELF_TEST_MARKER));
		// keep the matrix clean: drop marker entries from the report
		for (let i = consoleErrors.length - 1; i >= 0; i--) {
			if (consoleErrors[i].includes(SELF_TEST_MARKER)) consoleErrors.splice(i, 1);
		}
		if (!gotMarker) {
			failures++;
			console.log("SELFTEST FAIL: console.error events are not being captured (detection path broken)");
		} else {
			console.log(`SELFTEST OK: console error detection is live (viewports=${VIEWPORTS.length}, routes=${ROUTES.length})`);
		}
	}

	await cdp.send("Target.closeTarget", { targetId: target.targetId });
}

proc.kill();

const uniqErrors = [...new Set(consoleErrors)];
if (uniqErrors.length) {
  failures += uniqErrors.length;
  console.log("CONSOLE/PAGE ERRORS:");
  for (const e of uniqErrors.slice(0, 10)) console.log(`  ${e}`);
}

if (failures) {
  console.log(`RESPONSIVE: FAIL (${failures} violation(s))`);
  process.exit(1);
}
console.log("RESPONSIVE: ALL PASS");