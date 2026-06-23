# Ghost Sphere Engine — forked Remnawave backend (api + scheduler + jobs via pm2).
# The premium Ghost Sphere web UI is served separately (web container), so this
# image is API-only (DISABLE_FRONTEND=true).

FROM node:24-slim AS backend-build
WORKDIR /opt/app

ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x,linux-arm64-openssl-3.0.x

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
COPY patches ./patches

RUN npm install --no-audit --no-fund

COPY . .

RUN npm run migrate:generate
RUN npm run build
RUN npm cache clean --force
RUN npm prune --omit=dev

FROM node:24-slim

LABEL org.opencontainers.image.title="Ghost Sphere Engine"
LABEL org.opencontainers.image.description="Premium self-hosted VPN control plane (forked from Remnawave, AGPL-3.0)"
LABEL org.opencontainers.image.url="https://github.com/SKINOREZZZ101/SPHEREGHOST"
LABEL org.opencontainers.image.source="https://github.com/SKINOREZZZ101/SPHEREGHOST"
LABEL org.opencontainers.image.vendor="Ghost OS"
LABEL org.opencontainers.image.licenses="AGPL-3.0"

WORKDIR /opt/app

ENV PRISMA_HIDE_UPDATE_MESSAGE=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV PM2_DISABLE_VERSION_CHECK=true
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV DISABLE_FRONTEND=true

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=backend-build /opt/app/dist ./dist
COPY --from=backend-build /opt/app/prisma ./prisma
COPY --from=backend-build /opt/app/patches ./patches
COPY --from=backend-build /opt/app/node_modules ./node_modules

COPY configs /var/lib/remnawave/configs
COPY package*.json ./
COPY prisma.config.ts ./prisma.config.ts
COPY libs ./libs
COPY ecosystem.config.js ./
COPY docker-entrypoint.sh ./

RUN npm install pm2 -g && npm link

ENTRYPOINT [ "/bin/sh", "docker-entrypoint.sh" ]
CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "production" ]
