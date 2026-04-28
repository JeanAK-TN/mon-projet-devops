#!/usr/bin/env bash
# Smoke test : valide qu'un déploiement répond correctement.
# Usage : BASE_URL=https://my-app.example.com ./tests/smoke.sh
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
EXPECTED_STATUS="OK"

echo "== Smoke test against $BASE_URL =="

check() {
  local path="$1"
  local expected_code="$2"
  local code
  code=$(curl -s -o /tmp/smoke.body -w "%{http_code}" "$BASE_URL$path")
  if [[ "$code" != "$expected_code" ]]; then
    echo "FAIL  $path → got $code, expected $expected_code"
    cat /tmp/smoke.body || true
    exit 1
  fi
  echo "OK    $path → $code"
}

check "/api/health" "200"
check "/api/products" "200"
check "/metrics" "200"
check "/api/auth/me" "401"   # unauthenticated

# JSON content check on health
status=$(curl -s "$BASE_URL/api/health" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
if [[ "$status" != "$EXPECTED_STATUS" ]]; then
  echo "FAIL  /api/health body status=$status"
  exit 1
fi
echo "OK    /api/health body status=$status"

echo "== All smoke checks passed =="
