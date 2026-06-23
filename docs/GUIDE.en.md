<div align="center">

<img src="../web/public/ghost.svg" width="96" alt="Ghost Sphere" />

# Ghost Sphere — Complete Guide

**The premium unified control plane for the VPN ecosystem**
`v0.0.1` · Built by **Ghost OS**

[Русская версия →](./GUIDE.ru.md)

</div>

---

## Table of contents

1. [About Ghost Sphere](#1-about-ghost-sphere)
2. [Architecture](#2-architecture)
3. [Installation](#3-installation)
4. [First login & connecting a panel](#4-first-login--connecting-a-panel)
5. [Interface navigation](#5-interface-navigation)
6. [Sphere Overview (dashboard)](#6-sphere-overview-dashboard)
7. [Nodes](#7-nodes)
8. [Xray configurations](#8-xray-configurations)
9. [Hosts](#9-hosts)
10. [Users & keys](#10-users--keys)
11. [Subscription system (in depth)](#11-subscription-system-in-depth)
12. [Squads](#12-squads)
13. [Keys & tokens](#13-keys--tokens)
14. [Integrations](#14-integrations)
15. [Backups & restore](#15-backups--restore)
16. [Template storage](#16-template-storage)
17. [Settings](#17-settings)
18. [Security](#18-security)
19. [Updates & versioning](#19-updates--versioning)
20. [FAQ & troubleshooting](#20-faq--troubleshooting)

---

## 1. About Ghost Sphere

**Ghost Sphere** is a unified command center that brings the entire **Remnawave** ecosystem into one dark, technological and fast interface. From a single panel you manage:

- **nodes** (VPN servers running Xray),
- **Xray configurations** (profiles, inbounds, routing),
- **users** and their access keys,
- **subscriptions** (config delivery to clients),
- **hosts** (connection endpoints),
- **squads** (access groups),
- **API tokens & secrets**,
- **integrations** (bots, shops, monitoring),
- **backups** and the **template storage**.

It is designed to be far more convenient, professional and technological than existing tools: a dark **Ghost OS** theme, a `Ctrl+K` command palette, live metrics, restrained animations and full **RU / EN** localization.

> **Demo mode** lets you explore the whole interface on demo data without a real panel — perfect for evaluation and training.

---

## 2. Architecture

```
┌──────────────┐   /api (X-GS-Panel-*  ┌─────────────────────┐   Bearer token   ┌──────────────────┐
│ Ghost Sphere │   headers)            │  Ghost Sphere Core  │ ───────────────► │  Remnawave Panel │
│     Web      │ ─────────────────────►│   (NestJS gateway)  │                  │       API        │
│ React+Mantine│ ◄──────────────────── │   stateless         │ ◄─────────────── │                  │
└──────────────┘                       └─────────────────────┘                  └────────┬─────────┘
                                                                                          │ mTLS :2222
                                                                                 ┌────────▼─────────┐
                                                                                 │  VPN nodes (Xray)│
                                                                                 └──────────────────┘
```

| Component | What it is | Tech |
| --- | --- | --- |
| **Ghost Sphere Web** | The panel UI (SPA) | React 19, Vite, Mantine 8, TanStack Query, Zustand, i18next, Framer Motion, Monaco |
| **Ghost Sphere Core** | API gateway that proxies to Remnawave | NestJS 11, Axios |
| **Remnawave Panel** | Source of truth (DB, nodes, users) | NestJS + PostgreSQL + Redis |
| **Nodes** | VPN servers running Xray, managed by the panel | Xray-core, mTLS agent |

**Key idea:** the Ghost Sphere Core **does not store** the panel token. The web client forwards the panel URL and token in `X-GS-Panel-Url` / `X-GS-Panel-Token` headers on every request, so one core can serve multiple panels while the secret stays under the operator's control.

---

## 3. Installation

### 3.1. Docker (recommended)

Requires **Docker** and **Docker Compose**.

```bash
cd SPHERE-GHOST
docker compose up -d --build
```

Open **http://localhost:8080**.

- Change the port with `GHOST_SPHERE_PORT` (default `8080`):
  ```bash
  GHOST_SPHERE_PORT=9000 docker compose up -d --build
  ```
- Two containers come up:
  - `ghost-sphere-web` — nginx, serves the UI and proxies `/api` to the core;
  - `ghost-sphere-core` — the gateway (internal port `8088`).

Stop:

```bash
docker compose down
```

### 3.2. Local development

Requires **Node.js 20+** (22 recommended) and npm.

```bash
# install dependencies for both apps
npm run install:all

# Terminal 1 — core (NestJS)
npm run dev:api          # http://127.0.0.1:8088

# Terminal 2 — UI (Vite)
npm run dev:web          # http://127.0.0.1:4173
```

Vite proxies `/api` to the core automatically — no extra setup required.

### 3.3. Production behind a reverse proxy (HTTPS)

Expose Ghost Sphere over HTTPS only. **Caddy** example:

```caddy
sphere.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

**Nginx** example:

```nginx
server {
    listen 443 ssl http2;
    server_name sphere.example.com;
    ssl_certificate     /etc/letsencrypt/live/sphere.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sphere.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3.4. Environment variables

**Core (`api/.env`):**

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `8088` | Port the core listens on |
| `NODE_ENV` | — | `production` in Docker |

**Web (build-time):**

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE` | `/api` | Base path to the core |
| `VITE_APP_VERSION` | `0.0.1` | Version shown in the UI |

---

## 4. First login & connecting a panel

### 4.1. Create an API token in Remnawave

1. Sign in to the **Remnawave** admin panel.
2. Go to **Settings → API tokens**.
3. Click **Create token**, give it a name (e.g. `Ghost Sphere`).
4. Copy the **Bearer token** — it is shown only once.

> The token has the `API` role and is the correct way to connect external tools (unlike a browser admin session).

### 4.2. Connect

On the Ghost Sphere login screen:

1. **Panel URL** — your Remnawave panel URL, e.g. `https://panel.example.com` (without `/api`).
2. **API token** — paste the Bearer token from 4.1.
3. **X-Api-Key (Caddy / tinyauth)** — only fill this if the panel sits behind a proxy with extra auth; otherwise leave empty.
4. Click **Connect**.

If the URL and token are correct, you land on the “Sphere Overview” dashboard.

### 4.3. Demo mode

No panel yet, or just looking around? Click **“Enter demo mode”**. A fully working interface loads on demo data (nodes, users, configs, charts). Everything in demo is safe and never touches real infrastructure.

### 4.4. Token storage & security

- The token and panel URL are stored **locally in your browser** (localStorage) and, in live mode, are only sent to your Ghost Sphere Core, which proxies to the panel.
- Clear local data via **Settings → About → Danger zone → “Reset local data”** or the **Log out** button.
- Always use HTTPS in production (see 3.3).

---

## 5. Interface navigation

On the left — the **sidebar**, grouped into sections:

- **Overview** → Sphere Overview
- **Infrastructure** → Nodes, Configurations, Hosts
- **Access & Subscriptions** → Users, Subscriptions, Squads, Keys & Tokens
- **Growth & Integrations** → Integrations, Backups, Storage
- **System** → Settings, Guide

On top — the **top bar**:

- **Search / command palette** — press `Ctrl + K` (or `Cmd + K`) to jump to any section or run a quick action (create a node, user, backup, switch language).
- **Mode indicator** — `Demo` or `Online`.
- **Language** — switch **RU / EN** in one click.
- **Notifications**, **Settings**, **profile menu** (log out).

At the bottom of the sidebar — a mini **sphere health** widget (health, nodes online, users online).

---

## 6. Sphere Overview (dashboard)

The home screen shows the state of your infrastructure in real time:

- **Metric cards:** total users (with trend), online now, nodes online, monthly traffic — with sparklines.
- **Sphere power** — a summary ring based on the share of online nodes and active users, plus **CPU**, **RAM** and **uptime**.
- **User growth** — a time-series chart (total / active).
- **Top nodes by load** — a bar chart of traffic per node.
- **Recent activity** — an action feed (node connections, user creation, backups, etc.).
- **Quick actions** — add node / user / config / backup.

Refresh frequency is set in **Settings → General → Poll interval**.

---

## 7. Nodes

The VPN server management section. Two views are available: **cards** and **table** (toggle at the top right).

### What a node card shows

- Country flag, name, address and port.
- Status: **Connected** / **Connecting** / **Disconnected** / **Disabled**.
- Xray version, users online.
- **CPU**, **RAM**, **used traffic** meters (with a limit if set).
- Config profile and Xray uptime.

### Create a node

1. Click **Add node**.
2. Fill in: **Name**, **Address** (IP/domain), **Port** (usually `2222`), **Country** (two-letter code, e.g. `DE`), **Config profile**.
3. Click **Create**. The node appears as “Connecting” and connects automatically once the server agent is reachable.

### Node install wizard

For a fresh server use **Install node**:

1. Prepare a clean server (**Debian 12 / Ubuntu 22.04+**) with root access.
2. Copy the **install command** and run it on the server as root.
3. Paste the generated **SECRET_KEY** (it is created specifically for this node).
4. Open port **`2222/tcp`** for your panel IP and click **Connect**.

The `scripts/install-node.sh` script installs Docker (if needed), writes the node `docker-compose.yml` with the `SECRET_KEY`, and starts the agent:

```bash
SECRET_KEY="<paste from the wizard>" \
bash <(curl -Ls https://raw.githubusercontent.com/.../install-node.sh)
```

### Node actions

Via the “⋮” menu on a card/row:

- **Enable / Disable** — control availability.
- **Restart** — restart Xray on the node.
- **Reset traffic** — zero the used-traffic counter.
- **Delete** — remove the node (with confirmation).

### Consumption multiplier

The **consumption multiplier** accounts for “expensive” premium-location traffic: at a multiplier of `2`, each gigabyte on that node consumes twice as much from the user's quota.

### If a node won't connect

1. Make sure port **`2222/tcp`** is open for the panel IP (`ufw allow from <PANEL_IP> to any port 2222`).
2. Verify the node container is running: `docker ps`, `docker logs ghost-sphere-node`.
3. Check the **SECRET_KEY** (it is generated once for a specific node).
4. Read **“Last status”** on the card — the reason is shown there.

---

## 8. Xray configurations

Config profiles hold the full Xray JSON (`inbounds`, `outbounds`, `routing`, `dns`, `policy`, etc.). One profile can be applied to many nodes — changes roll out automatically.

### Profiles

- The **Profiles** tab shows cards with inbound lists, how many nodes use the profile, and the last-updated date.
- Open a profile to enter the **editor**.

### Editor (Monaco)

- A full JSON editor with syntax highlighting and a **Ghost Dark** theme.
- **Autocomplete and validation against the Xray schema** — hints for keys and values.
- **Validate** — semantic checks: duplicate tags, missing protocol, `reality` without `realitySettings`, etc. Results appear in a side panel (errors/warnings).
- **Format** — pretty-print the JSON.
- **X25519 keys** — generate a key pair for **REALITY** with one click.
- **Save** — applies the profile to linked nodes. Unsaved changes are highlighted.

### Snippets

Snippets are reusable JSON fragments (e.g. an ad-blocking rule) injected into the config via the `{{snippet:name}}` placeholder. They keep shared blocks consistent across profiles.

---

## 9. Hosts

A **host** is the connection endpoint the client ultimately receives (it defines the address, port, masking and security parameters).

Host fields:

- **Remark** — shown in the client.
- **Address**, **Port**.
- **Security**: `REALITY`, `TLS` or `none`.
- **SNI**, **Host**, **Path**, **ALPN**, **Fingerprint (fp)**.
- **Profile** and **Inbound** the host is bound to.
- An enable/disable toggle.

Hosts link users (via squads) to specific inbounds on nodes. A single user may receive several hosts in their subscription.

---

## 10. Users & keys

The VPN client management section.

### Top metrics

Total users, active, online, limit-reached/expired.

### Create a user (key)

1. Click **Create user**.
2. Fill in:
   - **Username** — a unique login.
   - **Traffic limit (GB)** — `0` means unlimited.
   - **Duration (days)** — when access expires.
   - **Reset strategy** — `No reset`, `Daily`, `Weekly`, `Monthly` (when the traffic counter resets).
3. Click **Create key**. The user immediately gets a subscription link.

### Fields and statuses

- **Status:** `Active`, `Disabled`, `Limit reached`, `Expired`.
- **Traffic:** used / limit (meter).
- **Expires at**, **online status**, **last seen**.
- **Squads**, **Devices (HWID)** and their limit, **Telegram ID**, **email**.

### User actions

- **Copy subscription link** (copy icon right in the table).
- **Enable / Disable**.
- **Reset traffic**.
- **Revoke key** — generates a new `shortUuid`; the old link stops working (use on compromise).

### Search & pagination

The search field filters by name/email; the list is paginated by 12.

---

## 11. Subscription system (in depth)

A subscription is a **per-user link** from which a VPN client downloads the up-to-date configuration (the list of servers and connection parameters). It is the heart of the user experience: you create a key, the client gets a working config and connects.

### 11.1. How the link works

Format:

```
https://<subscription-domain>/<shortUuid>
https://<subscription-domain>/<shortUuid>/<client-type>
```

- `shortUuid` — a short unique user identifier (generated on creation, changes on “revoke”).
- `<client-type>` — optional, forces a format: `json`, `v2ray-json`, `clash`, `mihomo`, `singbox`, `stash`.
- The subscription domain is configured on the Remnawave side (`SUB_PUBLIC_DOMAIN`) and usually points to the “subscription page”.

In Ghost Sphere you can copy a ready link in the **Users** section (copy icon) or see it on the user card.

### 11.2. Supported delivery formats

| Format | System type | Clients |
| --- | --- | --- |
| **Xray Base64 (v2ray)** | `XRAY_BASE64` | v2rayNG, v2rayN, Streisand, Shadowrocket, Nekoray |
| **Xray JSON** | `XRAY_JSON` | Happ, clients supporting raw Xray JSON |
| **Clash / Clash Meta** | `CLASH` | Clash for Windows, ClashX, Clash Meta |
| **Mihomo** | `MIHOMO` | Mihomo (Clash.Meta core) |
| **Sing-box** | `SINGBOX` | sing-box, Hiddify, Karing |
| **Stash** | `STASH` | Stash (iOS) |

### 11.3. Client apps by platform

| Platform | Recommended apps |
| --- | --- |
| **Android** | Happ, v2rayNG, Hiddify, NekoBox, Clash Meta for Android |
| **iOS** | Happ, Streisand, Shadowrocket, Stash, Sing-box |
| **Windows** | Hiddify, v2rayN, Nekoray, Clash Verge |
| **macOS** | Happ, Hiddify, ClashX Meta, Sing-box |
| **Linux** | Nekoray, sing-box, Clash Meta |

### 11.4. Format auto-detection (SRR — Subscription Response Rules)

When a client requests the link **without a type**, the system inspects the `User-Agent` header and, via **response rules (SRR)**, automatically returns the right format. For example, a request from `clash` gets a Clash config, from `sing-box` a Sing-box config, and from a browser an HTML subscription page.

Rules are configured in **Subscriptions → Response rules (SRR)** (a `User-Agent → format` matching editor).

### 11.5. Delivery templates

A **template** defines exactly how a given format is rendered (fields, sorting, server names, parameters). **Subscriptions → Templates** offers templates for Xray JSON, Clash/Mihomo, Sing-box and Stash. They can be edited to fit your brand and requirements.

> Ready-made templates are available in **Storage → Subscription templates** and can be applied with one click.

### 11.6. Subscription settings

In **Subscriptions → Settings**:

- **Profile title** — the name the user sees in the client (e.g. `Ghost Sphere VPN`).
- **Update interval (h)** — how often the client refreshes the config (12–24 h recommended).
- **Support link** — shown in the client/on the page.
- **Randomize hosts** — shuffles server order for even load distribution.

### 11.7. Subscription page (for browsers)

If a user opens the link **in a browser**, they see a polished **subscription page** rather than a raw config: the profile name, remaining traffic and expiry, a **QR code**, **“Open in app”** buttons and **install instructions** per platform. This is the most convenient path for end users.

The page appearance is configured in **Subscriptions → Subscription pages** (and templates in **Storage → Subscription pages**).

### 11.8. Device limit (HWID)

Each user can have a **device limit (HWID)**. With control enabled, the system remembers device “fingerprints” and blocks connections beyond the limit. The current number of bound devices is shown on the user card; the limit is set on create/edit.

### 11.9. Revoking a key

If a link is compromised, click **Revoke key** in the user actions. A new `shortUuid` is generated and the old link stops working immediately. The user must import the new link.

### 11.10. How a user connects (step by step)

**Option A — via the subscription page (easiest):**

1. Open the subscription link in the phone's browser.
2. Tap **“Open in app”** (e.g. Happ) — the app imports the profile itself.
3. Tap “Connect”.

**Option B — manually (any client):**

1. Copy the subscription link.
2. In the app choose **“Add from subscription / URL”**.
3. Paste the link → save → update the subscription.
4. Pick a server and connect.

**v2rayNG (Android) example:** “+” → “Import config from subscription” → paste URL → “Update subscriptions” → pick a server → connect.

**Hiddify example:** “Add profile from URL” → paste the link → the profile shows up with the server list.

### 11.11. Subscription troubleshooting

| Symptom | Cause & fix |
| --- | --- |
| Empty server list | No active hosts/inbounds for the user's squad. Check **Hosts** and **Squads**. |
| Client won't refresh the config | Update interval too long or client cached — refresh the subscription manually. |
| “Invalid format” in the client | Client got the wrong format. Specify a type in the link (`/clash`, `/singbox`) or configure **SRR**. |
| Connected but no internet | Node-side issue (Xray/routing). Check **Nodes** and **Configurations**. |
| “Device limit exceeded” | HWID limit triggered. Raise the limit or unbind an old device. |

---

## 12. Squads

**Squads** are access groups that link users to inbounds (and thus to hosts and servers).

- **Internal squads** — the core mechanism: define which inbounds members can use and which hosts are excluded.
- **External squads** — subscription delivery/branding overrides for specific groups (e.g. resellers).

A squad card shows member count and the inbound list. Create squads per tariff (Premium / Standard / Trial) and assign users.

---

## 13. Keys & tokens

Three tabs:

### API tokens

Tokens for programmatic panel access (used by the Ghost Sphere core itself and by bots/integrations). Create named tokens, copy the value (shown once), revoke unused ones.

### Node keys (mTLS)

Certificates and `SECRET_KEY` for node installation. Also generate an **X25519** pair here (used for REALITY).

### Secret vault

An encrypted store for passwords, bot tokens and provider keys (`TELEGRAM_BOT_TOKEN`, `CLOUDFLARE_API_KEY`, `S3_SECRET_KEY`, etc.). Values are hidden by default, revealed on demand and copied in one click.

---

## 14. Integrations

This section connects the rest of the ecosystem to the sphere. Cards are grouped by category, each with a status and a health indicator.

| Integration | Purpose |
| --- | --- |
| **Telegram shop** | Sell subscriptions, tariffs, payments, referrals in Telegram |
| **Admin bot** | Manage users/nodes from Telegram |
| **Cloudflare nodes** | Health-aware DNS for your nodes |
| **Xray Checker** | Monitor proxy/subscription health |
| **Whitebox** | Verify real reachability through the VPN tunnel |
| **MCP server** | Manage the panel via LLMs (Cursor / Claude) |
| **Backup agent** | Backups to Telegram / S3 / Google Drive |
| **WARP** | Native Cloudflare WARP as a WireGuard interface on nodes |

To connect an integration: open the card → **Connect** → provide an endpoint/secret (if required). The health indicator confirms the link works.

---

## 15. Backups & restore

- **Create backup** — choose the destination (**Local / S3 / Google Drive / Telegram**) and components (**DB**, **panel files**, **bots**).
- **Automatic backups** — enable and set a **cron schedule** (e.g. `0 4 * * *` — daily at 04:00) and retention (number of copies).
- **History** — a list of created copies with size and status; restore and download in one click.

> Keep backups off-box (S3 / Telegram), not only locally on the panel server.

---

## 16. Template storage

A catalog of ready-made templates, filtered by type:

- **Node Xray configs** (`XRAY_JSON`) — reference server configurations (REALITY, Vision, WARP routing).
- **Subscription templates** (`SUBSCRIPTION`) — Clash, Sing-box, etc.
- **Subscription pages** (`SUBPAGE`) — subscription page styling.
- **Response rules** (`SRR`) — ready User-Agent delivery rules.
- **Node plugins** (`NODE_PLUGIN`) — e.g. a torrent blocker.

Click **Apply** to install a template. Use **Import from catalog** to pull community templates.

---

## 17. Settings

- **Appearance** — accent color (Ghost / Spectre / Plasma / Toxic / Ember), interface density, toggles for **animations**, **glow** and **grain**.
- **Panels** — the active panel connection; add/switch panels.
- **General** — interface language (RU/EN), data poll interval.
- **About** — version, links and the **danger zone** (reset local data).

---

## 18. Security

- Expose Ghost Sphere **over HTTPS only** (reverse proxy + certificate).
- Use a dedicated **API token** for Ghost Sphere; on suspected leakage, revoke it in the panel and create a new one.
- Open the node port **`2222/tcp`** only to the panel IP, not the whole internet.
- Keep bot/provider secrets in the **Secret vault**, not in plain text.
- Take **backups** regularly and verify restores.
- Enable **HWID limits** so a single key isn't shared across dozens of devices.

---

## 19. Updates & versioning

- The project follows [SemVer](https://semver.org/) and starts at **`0.0.1`**.
- The version lives in three places: `web/package.json`, `api/package.json`, `api/src/common/version.ts`.
- Update via Docker:
  ```bash
  git pull
  docker compose up -d --build
  ```

---

## 20. FAQ & troubleshooting

**In live mode: “No panel connection” / request errors.**
Check the panel URL and token (Settings → Panels), the panel's network reachability, and the token's validity in Remnawave.

**The UI won't open on :8080.**
Make sure the containers are running: `docker compose ps`, and check logs: `docker compose logs web` and `docker compose logs api`.

**“User growth”/“Traffic” charts are empty in live mode.**
These series come from the panel's historical data; a fresh install has no history yet. Dashboard metrics and “Top nodes” still work.

**Is it safe to store the token in the browser?**
The token stays local and is only sent to your Ghost Sphere Core. For extra protection use HTTPS and, if needed, `X-Api-Key` (Caddy/tinyauth).

**Can I connect multiple panels?**
Yes. The core is stateless: just switch the active panel (credentials are forwarded as headers). Version 0.0.1 lays the groundwork for multi-panel management.

**Why a demo mode?**
To explore the full feature set without real infrastructure — for evaluation, training and demos.

---

<div align="center">

**Ghost Sphere** — _“Ghostly precision. Spherical control.”_

Built by **Ghost OS** · AGPL-3.0

</div>
