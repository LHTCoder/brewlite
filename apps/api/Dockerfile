# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---------- Stage 2: runtime (chỉ dependency production) ----------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh \
  && addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

# Phiên bản được CI truyền vào (commit SHA / tag) để hiện ở GET /health
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION
ENV API_PORT=4000
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${API_PORT}/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
