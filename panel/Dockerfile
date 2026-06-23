# syntax=docker/dockerfile:1
# ---- Ghost Sphere Panel — forked & rethemed Remnawave frontend (silver / phantom) ----
FROM node:22-alpine AS build
WORKDIR /opt/panel

# Big SPA (Monaco, Highcharts, Mantine) — give the bundler room to breathe.
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_ENV=production

# Install deps first for better layer caching.
COPY package.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Build the panel.
COPY . .
RUN npx vite build

# Self-host the Xray config-editor assets (wasm validator + JSON schemas) so the
# config editor keeps full validation without phoning a third-party at runtime.
RUN apk add --no-cache curl ca-certificates \
    && mkdir -p dist/assets \
    && (curl -fsSL https://validator.remna.dev/wasm_exec.js        -o dist/assets/wasm_exec.js        || true) \
    && (curl -fsSL https://validator.remna.dev/xray.schema.json    -o dist/assets/xray.schema.json    || true) \
    && (curl -fsSL https://validator.remna.dev/xray.schema.cn.json -o dist/assets/xray.schema.cn.json || true) \
    && (curl -fsSL https://validator.remna.dev/main.wasm           -o dist/assets/main.wasm           || true)

# ---- serve ----
FROM nginx:1.27-alpine AS serve
LABEL org.opencontainers.image.title="Ghost Sphere Panel"
LABEL org.opencontainers.image.description="Premium VPN control plane — full Remnawave fork, Ghost OS theme."
LABEL org.opencontainers.image.vendor="Ghost OS"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /opt/panel/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --retries=10 --start-period=10s \
    CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
