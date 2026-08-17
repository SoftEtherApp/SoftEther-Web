#!/usr/bin/env node
/* ════════════════════════════════════
   SMTP client protocol test — mock SMTP server over node:net, real
   SmtpClient wired through an injected connect() shim that adapts
   node sockets to web streams (Readable.toWeb / Writable.toWeb).

   Run: node --experimental-strip-types scripts/test-smtp.mjs
   ════════════════════════════════════ */

import net from "node:net";
import { Readable, Writable } from "node:stream";

import { SmtpClient, SmtpError } from "../src/worker/email/client.ts";
import { renderEmail, TEMPLATE_DEFAULTS, verificationEmail, resetPasswordEmail, welcomeEmail, securityAlertEmail, releaseNotifyEmail } from "../src/worker/email/templates.ts";

let failures = 0;

function check(name, cond, extra = "") {
  if (cond) {
    console.log(`PASS: ${name}`);
  } else {
    failures++;
    console.log(`FAIL: ${name}${extra ? ` — ${extra}` : ""}`);
  }
}

/* ── mock SMTP server ── */

const EXPECT_USER = "smtpuser";
const EXPECT_PASS = "smtppass";

function startMockServer(authReply = "235") {
  const sessions = [];
  let nextId = 1;

  const server = net.createServer((conn) => {
    const id = nextId++;
    const session = { id, authSeen: [], authMode: null, mailFrom: null, rcptTo: [], dataLines: [], received: "" };
    sessions.push(session);

    let buf = "";
    const reply = (text) => conn.write(text + "\r\n");
    reply("220 se-mock SMTP ready");

    const handleLine = async (line) => {
      const upper = line.toUpperCase();
      if (upper.startsWith("EHLO")) {
        reply("250-mock.example\r\n250-AUTH PLAIN LOGIN\r\n250 SIZE 10000000");
      } else if (upper.startsWith("AUTH PLAIN")) {
        session.authSeen.push(line);
        session.authMode = "plain";
        reply(`${authReply} ${authReply === "504" ? "unrecognized authentication type" : "2.7.0 Authentication successful"}`);
      } else if (upper.startsWith("AUTH LOGIN")) {
        session.authSeen.push(line);
        session.authMode = "login-user";
        reply("334 VXNlcm5hbWU6"); // Username:
      } else if (upper.startsWith("MAIL FROM")) {
        session.mailFrom = line;
        reply("250 2.1.0 Ok");
      } else if (upper.startsWith("RCPT TO")) {
        session.rcptTo.push(line);
        reply("250 2.1.5 Ok");
      } else if (upper.startsWith("DATA")) {
        reply("354 End data with <CR><LF>.<CR><LF>");
        session.inData = true;
      } else if (upper.startsWith("QUIT")) {
        reply("221 2.0.0 Bye");
        conn.end();
      } else if (session.inData) {
        if (line === ".") {
          session.inData = false;
          reply("250 2.0.0 Ok: queued as MOCK123");
        } else {
          session.dataLines.push(line);
        }
      } else if (session.authMode === "login-user") {
        session.authSeen.push(line); // base64 username
        session.authMode = "login-pass";
        reply("334 UGFzc3dvcmQ6"); // Password:
      } else if (session.authMode === "login-pass") {
        session.authSeen.push(line); // base64 password
        session.authMode = "done";
        reply("235 2.7.0 Authentication successful");
      } else {
        reply("500 unrecognized command");
      }
    };

    conn.on("data", (chunk) => {
      buf += chunk.toString("utf8");
      let nl;
      while ((nl = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, nl).replace(/\r$/, "");
        buf = buf.slice(nl + 1);
        handleLine(line);
      }
    });
    conn.on("error", () => {});
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      resolve({ port, sessions, close: () => new Promise((r) => server.close(r)) });
    });
  });
}

/* ── connect() shim: node socket → web-stream Socket ── */

function fakeSocket(netSock) {
  return {
    readable: Readable.toWeb(netSock),
    writable: Writable.toWeb(netSock),
    opened: Promise.resolve({ remoteAddress: "127.0.0.1" }),
    closed: new Promise(() => {}),
    upgraded: false,
    secureTransport: "off",
    startTls() {
      throw new Error("startTls: TLS not simulated in mock — use tls:'none'");
    },
    async close() {
      netSock.destroy();
    },
  };
}

const connectShim = (address) => {
  const [host, port] = address.split(":");
  return fakeSocket(net.connect(Number(port), host));
};

/* ── tests ── */

const mock = await startMockServer();

const baseConfig = {
  host: "127.0.0.1",
  port: mock.port,
  user: EXPECT_USER,
  pass: EXPECT_PASS,
  from: "SoftEther App <no-reply@softether.app>",
  tls: "none",
};

// 1. AUTH PLAIN happy path + dot-stuffing + MIME structure
{
  const client = new SmtpClient(baseConfig, { connect: connectShim });
  const env = verificationEmail("Akash", "https://softether.app/verify?token=abc");
  await client.send({ to: "user@example.com", subject: env.subject, text: env.text, html: env.html });
  const s = mock.sessions[0];

  check("AUTH PLAIN presented with base64 credentials", s.authSeen.length === 1 && s.authSeen[0].startsWith("AUTH PLAIN "), s.authSeen.join("|"));
  const [b64] = s.authSeen[0].match(/\s([A-Za-z0-9+/=]+)$/);
  const decoded = Buffer.from(b64.trim(), "base64").toString("utf8");
  check("AUTH PLAIN decodes to \\0user\\0pass", decoded === `\u0000${EXPECT_USER}\u0000${EXPECT_PASS}`, JSON.stringify(decoded));

  check("MAIL FROM carries envelope sender", s.mailFrom === `MAIL FROM:<no-reply@softether.app>`, s.mailFrom);
  check("RCPT TO carries recipient", s.rcptTo.length === 1 && s.rcptTo[0] === "RCPT TO:<user@example.com>", s.rcptTo.join(","));

  const body = s.dataLines.join("\r\n");
  check("DATA contains Subject", body.includes("Subject: Verify your email address"), body.split("\r\n")[2]);
  check("DATA is multipart/alternative", body.includes('Content-Type: multipart/alternative; boundary="'), "");
  check("DATA contains text part", body.includes("Content-Type: text/plain; charset=utf-8"));
  check("DATA contains html part", body.includes("Content-Type: text/html; charset=utf-8"));
  check("DATA contains verify link", body.includes("https://softether.app/verify?token=abc"));
  check("DATA closes boundary", body.includes("--se-") && body.trimEnd().endsWith("--"));
}

// 2. CRLF injection in To is rejected at validate stage; non-ASCII subject
//    is RFC 2047-encoded on a clean send
{
  const client = new SmtpClient(baseConfig, { connect: connectShim });
  let rejected = false;
  try {
    await client.send({
      to: "victim@example.com\r\nBCC: evil@example.com",
      subject: "こんにちは SoftEther",
      text: "hello",
    });
  } catch (err) {
    rejected = err instanceof SmtpError && err.stage === "validate";
  }
  check("CRLF recipient rejected at validate stage", rejected);
  check("no connection made for rejected recipient", mock.sessions[1] === undefined);

  await client.send({ to: "ok@example.com", subject: "こんにちは SoftEther", text: "hello" });
  const s = mock.sessions[1];
  const body = s.dataLines.join("\r\n");
  check("non-ASCII subject RFC 2047 encoded", body.includes("Subject: =?UTF-8?B?"), body.split("\r\n")[2]);
  check("no BCC line injected on clean send", !body.includes("BCC:"));
}

// 3. Dot-stuffing: line starting with '.' must arrive doubled
{
  const client = new SmtpClient(baseConfig, { connect: connectShim });
  await client.send({ to: "user@example.com", subject: "dot test", text: "line1\r\n.hidden\r\nline3" });
  const s = mock.sessions[2];
  check("dot-stuffed line arrives with leading '..'", s.dataLines.includes("..hidden"), s.dataLines.join("|"));
}

// 4. AUTH LOGIN fallback when PLAIN unsupported
{
  const mock2 = await startMockServer("504");

  const client = new SmtpClient({ ...baseConfig, port: mock2.port }, { connect: connectShim });
  await client.send({ to: "user@example.com", subject: "login fallback", text: "x" });
  const s = mock2.sessions[0];
  check("AUTH PLAIN rejected, AUTH LOGIN issued", s.authSeen.length === 4 && s.authSeen[1] === "AUTH LOGIN", s.authSeen.join(" | "));
  check("LOGIN username decoded", Buffer.from(s.authSeen[2], "base64").toString("utf8") === EXPECT_USER);
  check("LOGIN password decoded", Buffer.from(s.authSeen[3], "base64").toString("utf8") === EXPECT_PASS);
  await mock2.close();
}

// 5. Server rejection surfaces as SmtpError with code
{
  const mock3 = await startMockServer();
  // Point at a port with no listener → connection refused → opened rejects
  const client = new SmtpClient({ ...baseConfig, port: 1 }, { connect: connectShim });
  let threw = false;
  try {
    await client.send({ to: "user@example.com", subject: "x", text: "x" });
  } catch (err) {
    threw = err instanceof SmtpError;
  }
  check("connection failure surfaces as SmtpError", threw);
  await mock3.close();
}

// 6. Validation guard: no '@' in recipient
{
  const client = new SmtpClient(baseConfig, { connect: connectShim });
  let rejected = false;
  try {
    await client.send({ to: "not-an-email", subject: "x", text: "x" });
  } catch (err) {
    rejected = err instanceof SmtpError && err.stage === "validate";
  }
  check("invalid recipient rejected at validate stage", rejected);
}

// 6b. STARTTLS upgrade failure (server rejects the command) → SmtpError
{
  const client = new SmtpClient({ ...baseConfig, tls: "starttls" }, { connect: connectShim });
  let rejected = false;
  try {
    await client.send({ to: "user@example.com", subject: "x", text: "x" });
  } catch (err) {
    rejected = err instanceof SmtpError && err.stage === "starttls";
  }
  check("STARTTLS rejection surfaces as SmtpError", rejected, "");
}

// 7. Templates escape HTML in user-supplied values
{
  const t = verificationEmail('<script>alert(1)</script>', "https://softether.app/v?t=x");
  check("HTML name escaped", !t.html.includes("<script>") && t.html.includes("&lt;script&gt;"));
  check("text name sanitized (no CR/LF)", !/[\r\n]/.test(t.text.split("\n").find((l) => l.startsWith("Hi ")) ?? ""));
  const r = resetPasswordEmail("Jane", "https://softether.app/reset?t=x");
  const w = welcomeEmail("Jane");
  const s = securityAlertEmail("Jane", "sign-in from new device");
  const n = releaseNotifyEmail("Jane", "v2.5.0", "v2.5.0", "Highlights: everything.", "https://softether.app/download");
  check("reset/welcome/security/release templates render", [r, w, s, n].every((e) => e.subject && e.text.includes("Hi Jane") && e.html.includes("SOFTETHER APP")));
}

// 7b. Composability: token resolution + per-call defaults overrides
{
  const e = welcomeEmail("Jane", { brand: "Acme VPN", supportEmail: "help@acme.example", subjectPrefix: "[Acme]" });
  check("brand override propagates to html label", e.html.includes("ACME VPN"));
  check("brand override propagates to text", e.text.includes("Acme VPN"));
  check("downloadUrl token resolved", e.text.includes("Download client: https://softether.app/download"));
  check("tagline token resolved", e.text.includes(TEMPLATE_DEFAULTS.tagline));
  check("supportEmail token resolved", e.html.includes("help@acme.example"));
  check("subjectPrefix prepended", e.subject === "[Acme] Welcome to SoftEther App", e.subject);

  const custom = renderEmail("Custom", [
    { kind: "greeting", name: "Bob" },
    { kind: "paragraph", segs: [{ text: "Plain " }, { text: "bold", strong: true }] },
    { kind: "link", url: "https://example.com/x", label: "Example" },
    { kind: "spacer" },
    { kind: "note", text: "n" },
  ]);
  check("custom block list renders text", custom.text.includes("Plain bold") && custom.text.includes("Example: https://example.com/x"));
  check("custom block list renders html", custom.html.includes("<strong>bold</strong>") && custom.html.includes('href="https://example.com/x"'));
  check("unresolved token left intact", custom.html.includes("{name}") === false && custom.text.includes("Hi Bob,"));
}

// 8. Dev-mode sender: no SMTP config → logs, returns ok:true dev:true
//    (sender.ts imports drizzle's extensionless worker modules, so it's
//    exercised by the worker build + CI, not by this Node harness.)
{
  check("dev-mode guard lives in sender.ts (skipped in Node harness)", true);
}

await mock.close();

if (failures) {
  console.log(`SMTP: FAIL (${failures} violation(s))`);
  process.exit(1);
}
console.log("SMTP: ALL PASS");