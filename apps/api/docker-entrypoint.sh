#!/bin/sh
# Entrypoint cho container API:
#  1. Chạy migration (an toàn: TypeORM ghi bảng "migrations", chạy lại không tạo trùng)
#  2. Seed dữ liệu mẫu nếu SEED_ON_START=true (idempotent)
#  3. Khởi động API
set -e

echo "[entrypoint] Running database migrations..."
node dist/database/migrate.js

if [ "$SEED_ON_START" = "true" ]; then
  echo "[entrypoint] Seeding sample data..."
  node dist/database/seed.js
fi

echo "[entrypoint] Starting BrewLite API (version: ${APP_VERSION:-dev})"
exec node dist/main.js
