#!/usr/bin/env bash
# Regression test: deep links (/library, /nope, ...) must serve the BUILT SPA
# shell (hashed bundles) AT the requested URL — not the raw source template
# (blank page) and not a bounce to the home page (URL lost via the assets
# canonical /index.html 307). API and download routes must still hit the
# Worker.
#
# Regression for: https://softether.app/library opened directly rendered a
# blank page because the worker fallback served the raw source index.html
# (`/src/app/main.tsx`) or (after the binding fix) returned the assets
# canonical 307 so the browser landed on "/".
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-8791}"
BASE="http://127.0.0.1:${PORT}"
LOG="$(mktemp -t deeplinks-dev.XXXXXX.log)"

cleanup() {
  if [[ -n "${DEV_PID:-}" ]]; then
    # setsid puts wrangler+npm+workerd in their own group; kill the group.
    kill -- "-$(ps -o pgid= -p "${DEV_PID}" | tr -d ' ')" 2>/dev/null || true
  fi
  rm -f "${LOG}"
}
trap cleanup EXIT

echo "==> building"
npm run build >/dev/null

echo "==> starting wrangler dev on :${PORT}"
setsid npx wrangler dev --port "${PORT}" >"${LOG}" 2>&1 &
DEV_PID=$!

ready=0
for _ in $(seq 1 60); do
  if curl -sf "${BASE}/" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done
if [[ "${ready}" != "1" ]]; then
  echo "FAIL: dev server did not become ready"
  tail -30 "${LOG}"
  exit 1
fi

failures=0

# Deep links: serve the built shell, at the requested URL, with no dev-src
# marker. Known SPA routes answer 200; unknown routes (incl. the previously
# "phantom" /features) answer real HTTP 404 while still shipping the shell so
# the client can render the NotFound page. This makes the not-found semantics
# visible to crawlers, link checkers, and no-JS clients.
declare -A EXPECTED_STATUS=(
  ["/library"]=200 ["/nope"]=404 ["/library/"]=200
  ["/changelog"]=200 ["/privacy"]=200 ["/security"]=200 ["/features"]=404
)

for path in /library /nope /library/ /changelog /privacy /security /features; do
  out="$(curl -s -H 'Sec-Fetch-Mode: navigate' -w '__FINAL__%{url_effective}__STATUS__%{http_code}' "${BASE}${path}")"
  body="${out%%__FINAL__*}"
  rest="${out#*__FINAL__}"
  final="${rest%%__STATUS__*}"
  status="${rest##*__STATUS__}"

  ok=1
  [[ "${status}" == "${EXPECTED_STATUS[${path}]}" ]] || { echo "FAIL: ${path} status ${status} != expected ${EXPECTED_STATUS[${path}]}"; ok=0; }
  echo "${body}" | grep -q '/assets/index-' || { echo "FAIL: ${path} body has no hashed bundle"; ok=0; }
  echo "${body}" | grep -q '/src/app/main.tsx' && { echo "FAIL: ${path} body references dev template"; ok=0; }
  [[ "${final}" == "${BASE}${path}" ]] || { echo "FAIL: ${path} final URL ${final} != ${BASE}${path} (redirect bounce)"; ok=0; }

  if [[ "${ok}" == "1" ]]; then
    echo "PASS: ${path} -> ${status}, built shell at its own URL"
  else
    failures=$((failures + 1))
  fi
done

api="$(curl -s -w '\n%{http_code}' "${BASE}/api/")"
if echo "${api}" | grep -q '{"name":"SoftEther App API"' && echo "${api}" | tail -1 | grep -q '200'; then
  echo "PASS: /api/ still reaches worker"
else
  echo "FAIL: /api/ broken"
  echo "${api}" | head -3
  failures=$((failures + 1))
fi

if [[ "${failures}" -gt 0 ]]; then
  echo "FAIL: ${failures} check(s) failed"
  exit 1
fi

echo "ALL PASS"