#!/usr/bin/env node
/* ════════════════════════════════════
   Auth module tests — pure surface of auth/password.ts + auth/validate.ts
   (handlers need a live D1/KV binding, exercised by build + CI).

   Run: node --experimental-strip-types scripts/test-auth.mjs
   ════════════════════════════════════ */

import {
  hashPassword,
  verifyPassword,
  PBKDF2_ITERATIONS,
  PBKDF2_SALT_BYTES,
  PBKDF2_KEY_BYTES,
} from "../src/worker/auth/password.ts";
import { normalizeEmail, normalizeName, checkPassword } from "../src/worker/auth/validate.ts";

let failures = 0;

function check(name, cond, extra = "") {
  if (cond) {
    console.log(`PASS: ${name}`);
  } else {
    failures++;
    console.log(`FAIL: ${name}${extra ? ` — ${extra}` : ""}`);
  }
}

// 1. hashPassword: format, salt uniqueness, roundtrip
{
  const h1 = await hashPassword("correct horse battery staple");
  const h2 = await hashPassword("correct horse battery staple");
  const parts = h1.split("$");
  check("hash format is pbkdf2-sha256$iters$salt$key", parts.length === 4 && parts[0] === "pbkdf2-sha256", h1);
  check("iteration count encoded", Number.parseInt(parts[1], 10) === PBKDF2_ITERATIONS);
  check("salt is 16 bytes b64", Buffer.from(parts[2], "base64").length === PBKDF2_SALT_BYTES);
  check("key is 32 bytes b64", Buffer.from(parts[3], "base64").length === PBKDF2_KEY_BYTES);
  check("same password hashes to different salts", h1 !== h2, "");
}

// 2. verifyPassword: correct/wrong/format
{
  const h = await hashPassword("s3cret!");
  check("correct password verifies", await verifyPassword("s3cret!", h));
  check("wrong password rejected", !(await verifyPassword("s3cret?", h)));
  check("empty password rejected", !(await verifyPassword("", h)));
  check("malformed hash rejected", !(await verifyPassword("x", "not-a-hash")));
  check("wrong algorithm prefix rejected", !(await verifyPassword("x", `bcrypt$${PBKDF2_ITERATIONS}$${h.split("$")[2]}$${h.split("$")[3]}`)));
  check("bad salt b64 rejected", !(await verifyPassword("x", `pbkdf2-sha256$${PBKDF2_ITERATIONS}$!!!$${h.split("$")[3]}`)));
}

// 3. normalizeEmail
{
  check("lowercases + trims", normalizeEmail("  Jane@Example.COM  ") === "jane@example.com");
  check("accepts plus addressing", normalizeEmail("user+tag@example.com") === "user+tag@example.com");
  check("rejects no-tld", normalizeEmail("user@localhost") === null);
  check("rejects spaces", normalizeEmail("us er@example.com") === null);
  check("rejects angle brackets", normalizeEmail("user@example.com>") === null);
  check("rejects missing @", normalizeEmail("user.example.com") === null);
  check("rejects overlong", normalizeEmail(`a@${"b".repeat(300)}.com`) === null);
  check("rejects non-string", normalizeEmail(null) === null);
}

// 4. normalizeName
{
  check("trims + collapses spaces", normalizeName("  Jane   Doe  ") === "Jane Doe");
  check("single word ok", normalizeName("Jane") === "Jane");
  check("rejects empty", normalizeName("   ") === null);
  check("rejects overlong", normalizeName("j".repeat(65)) === null);
  check("rejects angle brackets", normalizeName("Jane <jane@x.com>") === null);
  check("rejects CRLF", normalizeName("Jane\r\nBCC: x") === null);
}

// 5. checkPassword
{
  check("min length ok", checkPassword("12345678"));
  check("rejects short", !checkPassword("1234567"));
  check("rejects overlong", !checkPassword("x".repeat(129)));
  check("rejects empty", !checkPassword(""));
  check("rejects non-string", !checkPassword(12345));
}

if (failures) {
  console.log(`AUTH: FAIL (${failures} violation(s))`);
  process.exit(1);
}
console.log("AUTH: ALL PASS");