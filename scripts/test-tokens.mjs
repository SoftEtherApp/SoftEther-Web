#!/usr/bin/env node
/* ════════════════════════════════════
   Email token store tests — pure crypto surface of tokens.ts
   (store layer needs a live D1 binding, exercised by build + CI).

   Run: node --experimental-strip-types scripts/test-tokens.mjs
   ════════════════════════════════════ */

import {
  EMAIL_TOKEN_BYTES,
  EMAIL_TOKEN_KINDS,
  EMAIL_TOKEN_TTL_MS,
  generateEmailToken,
  hashEmailToken,
  isEmailTokenKind,
  timingSafeEqualHex,
} from "../src/worker/email/tokens.ts";

let failures = 0;

function check(name, cond, extra = "") {
  if (cond) {
    console.log(`PASS: ${name}`);
  } else {
    failures++;
    console.log(`FAIL: ${name}${extra ? ` — ${extra}` : ""}`);
  }
}

const B64URL = /^[A-Za-z0-9_-]+$/;

// 1. generateEmailToken: format, length, entropy
{
  const t = generateEmailToken();
  check("token is base64url", B64URL.test(t));
  check("token length matches 32 random bytes", t.length === Math.ceil((EMAIL_TOKEN_BYTES * 8) / 6), t.length);
  check("tokens are unique", new Set(Array.from({ length: 50 }, generateEmailToken)).size === 50);
}

// 2. hashEmailToken: sha-256 hex, deterministic, distinct
{
  const t = generateEmailToken();
  const h1 = await hashEmailToken(t);
  const h2 = await hashEmailToken(t);
  const h3 = await hashEmailToken(generateEmailToken());
  check("hash is 64 hex chars", /^[0-9a-f]{64}$/.test(h1), h1);
  check("hash is deterministic", h1 === h2);
  check("distinct tokens hash differently", h1 !== h3);
  check("hash is not the raw token", h1 !== t);
}

// 3. timingSafeEqualHex
{
  const a = await hashEmailToken("same");
  const b = await hashEmailToken("same");
  const c = await hashEmailToken("other");
  check("equal hashes compare true", timingSafeEqualHex(a, b));
  check("different hashes compare false", !timingSafeEqualHex(a, c));
  check("length mismatch compares false", !timingSafeEqualHex(a, "abc"));
  check("empty vs empty compares true", timingSafeEqualHex("", ""));
  check("invalid hex does not throw", timingSafeEqualHex("zz", "00") === false);
}

// 4. kinds
{
  check("verify_email is a valid kind", isEmailTokenKind("verify_email"));
  check("reset_password is a valid kind", isEmailTokenKind("reset_password"));
  check("unknown kind rejected", !isEmailTokenKind("magic_link"));
  check("kinds are a closed set", EMAIL_TOKEN_KINDS.length === 2);
}

// 5. TTL contract
{
  check("default TTL is 1 hour", EMAIL_TOKEN_TTL_MS === 60 * 60 * 1000);
}

if (failures) {
  console.log(`TOKENS: FAIL (${failures} violation(s))`);
  process.exit(1);
}
console.log("TOKENS: ALL PASS");