#!/usr/bin/env node
/* ════════════════════════════════════
   Admin API validator tests — pure surface of admin/validate.ts
   (route handlers need a live D1 binding, exercised by build + CI).

   Run: node --experimental-strip-types scripts/test-admin.mjs
   ════════════════════════════════════ */

import {
  parseEnabled,
  parseRole,
  parseUserStatus,
  USER_STATUSES,
  ROLE_MAX_LENGTH,
  DEFAULT_INVITE_ROLE,
} from "../src/worker/admin/validate.ts";

let failures = 0;

function check(name, cond, extra = "") {
  if (cond) {
    console.log(`PASS: ${name}`);
  } else {
    failures++;
    console.log(`FAIL: ${name}${extra ? ` — ${extra}` : ""}`);
  }
}

// 1. parseUserStatus
{
  check("status 'active' parses", parseUserStatus("active") === "active");
  check("status 'suspended' parses", parseUserStatus("suspended") === "suspended");
  check("status 'invited' parses", parseUserStatus("invited") === "invited");
  check("status case-insensitive", parseUserStatus("Suspended") === "suspended");
  check("status trimmed", parseUserStatus("  active ") === "active");
  check("unknown status rejected", parseUserStatus("deleted") === null);
  check("non-string status rejected", parseUserStatus(3) === null);
  check("null status rejected", parseUserStatus(null) === null);
  check("undefined status rejected", parseUserStatus(undefined) === null);
  check("statuses match API contract", USER_STATUSES.length === 3);
}

// 2. parseRole
{
  check("role parses", parseRole("operator") === "operator");
  check("role trimmed", parseRole("  moderator ") === "moderator");
  check("empty role falls back to default", parseRole("") === DEFAULT_INVITE_ROLE);
  check("whitespace role falls back to default", parseRole("   ") === DEFAULT_INVITE_ROLE);
  check("default invite role is 'user'", DEFAULT_INVITE_ROLE === "user");
  check("custom fallback honored", parseRole("", "admin") === "admin");
  const long = "x".repeat(ROLE_MAX_LENGTH + 1);
  check(`role over ${ROLE_MAX_LENGTH} chars rejected`, parseRole(long) === null);
  check(`role at ${ROLE_MAX_LENGTH} chars accepted`, parseRole("x".repeat(ROLE_MAX_LENGTH)) !== null);
  check("non-string role rejected", parseRole(7) === null);
}

// 3. parseEnabled
{
  check("boolean true", parseEnabled(true) === true);
  check("boolean false", parseEnabled(false) === false);
  check("numeric 1", parseEnabled(1) === true);
  check("numeric 0", parseEnabled(0) === false);
  check("string 'true'", parseEnabled("true") === true);
  check("string 'false'", parseEnabled("false") === false);
  check("string '1'", parseEnabled("1") === true);
  check("string '0'", parseEnabled("0") === false);
  check("string 'yes' rejected", parseEnabled("yes") === null);
  check("null rejected", parseEnabled(null) === null);
  check("undefined rejected", parseEnabled(undefined) === null);
  check("object rejected", parseEnabled({}) === null);
}

if (failures > 0) {
  console.error(`\n${failures} FAILURE(S)`);
  process.exit(1);
}
console.log("\nADMIN VALIDATORS: ALL PASS");