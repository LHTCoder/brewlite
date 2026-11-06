#!/usr/bin/env bash
# Smoke test sau triển khai: chờ API healthy, kiểm tra version, menu và trang web.
# Dùng: API_URL=https://... WEB_URL=https://... EXPECTED_VERSION=<sha> bash scripts/smoke-test.sh
set -euo pipefail

API_URL="${API_URL:?Thiếu API_URL}"
WEB_URL="${WEB_URL:?Thiếu WEB_URL}"
EXPECTED_VERSION="${EXPECTED_VERSION:-}"
TIMEOUT="${TIMEOUT:-300}"

echo "⏳ Chờ $API_URL/health (tối đa ${TIMEOUT}s)..."
start=$(date +%s)
while true; do
  body=$(curl -fsS -m 15 "$API_URL/health" 2>/dev/null || true)
  if [[ -n "$body" ]] && echo "$body" | grep -q '"status":"ok"'; then
    version=$(echo "$body" | sed -n 's/.*"version":"\([^"]*\)".*/\1/p')
    echo "✅ health ok – version: $version"
    if [[ -n "$EXPECTED_VERSION" ]] && [[ "$version" != *"$EXPECTED_VERSION"* ]]; then
      echo "   (chưa phải phiên bản mong đợi $EXPECTED_VERSION, tiếp tục chờ...)"
    else
      break
    fi
  fi
  if (( $(date +%s) - start > TIMEOUT )); then
    echo "❌ Health check thất bại sau ${TIMEOUT}s. Body cuối: $body"
    exit 1
  fi
  sleep 10
done

echo "⏳ Kiểm tra GET /products..."
count=$(curl -fsS -m 20 "$API_URL/products" | grep -o '"id"' | wc -l)
if (( count < 1 )); then echo "❌ /products rỗng hoặc lỗi"; exit 1; fi
echo "✅ /products trả $count sản phẩm"

echo "⏳ Kiểm tra web $WEB_URL ..."
code=$(curl -s -o /dev/null -w '%{http_code}' -m 60 "$WEB_URL/")
if [[ "$code" != "200" ]]; then echo "❌ Web trả HTTP $code"; exit 1; fi
echo "✅ Web trả 200"

echo "🎉 Smoke test PASSED"
