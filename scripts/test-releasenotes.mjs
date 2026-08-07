// Unit check for the release-notes tokenizer (pure TS, runnable with
// `node scripts/test-releasenotes.mjs` — no framework needed).
import assert from "node:assert/strict";
import { tokenizeInline } from "../src/react-app/lib/releaseNotesInline.ts";

// **bold** with surrounding text
assert.deepEqual(tokenizeInline("Add **dark mode** support"), [
  { type: "text", text: "Add " },
  { type: "bold", text: "dark mode" },
  { type: "text", text: " support" },
]);

// [link](url)
assert.deepEqual(tokenizeInline("See [docs](https://example.com) now"), [
  { type: "text", text: "See " },
  { type: "link", text: "docs", href: "https://example.com" },
  { type: "text", text: " now" },
]);

// `code`
assert.deepEqual(tokenizeInline("Use `-Dtarget=aarch64`"), [
  { type: "text", text: "Use " },
  { type: "code", text: "-Dtarget=aarch64" },
]);

// plain text untouched
assert.deepEqual(tokenizeInline("just words"), [{ type: "text", text: "just words" }]);

// unsafe schemes are demoted to plain text — never clickable links
for (const bad of ["[x](javascript:alert(1))", "[x](data:text/html,hi)", "[x](vbscript:msgbox)", "[x](file:///etc/passwd)"]) {
  const toks = tokenizeInline(bad);
  assert.ok(!toks.some((t) => t.type === "link"), `${bad} must not produce a link`);
  assert.ok(toks.every((t) => t.type !== "link"), `no href from unsafe scheme: ${bad}`);
}

// safe schemes and relative hrefs remain links
assert.deepEqual(tokenizeInline("[a](https://x) [b](/docs) [c](mailto:hi@x.io)"), [
  { type: "link", text: "a", href: "https://x" },
  { type: "text", text: " " },
  { type: "link", text: "b", href: "/docs" },
  { type: "text", text: " " },
  { type: "link", text: "c", href: "mailto:hi@x.io" },
]);

// mixed, no raw-HTML paths reachable
const mixed = tokenizeInline("**a** [b](https://x) `c` <script>alert(1)</script>");
assert.ok(mixed.some((t) => t.type === "bold" && t.text === "a"));
assert.ok(mixed.some((t) => t.type === "link" && t.href === "https://x"));
assert.ok(mixed.some((t) => t.type === "code" && t.text === "c"));
assert.ok(mixed.some((t) => t.type === "text" && t.text.includes("<script>")));
// <script> stays TEXT: output is rendered as escaped React text, never HTML.
assert.ok(!mixed.some((t) => t.type === "bold" && t.text === "alert(1)"));
assert.ok(!mixed.some((t) => t.type === "link" && t.text === "script"));

console.log("release-notes tokenizer: ALL PASS");