#!/usr/bin/env bash
# =============================================================================
# Ghost Sphere — one-command panel installer (Debian / Ubuntu)
# Developed by Ghost OS
#
#   curl -fsSL https://raw.githubusercontent.com/SKINOREZZZ101/SPHEREGHOST/main/scripts/install.sh | bash
#
# Installs a clean Docker CE + Compose v2, clones the repo to /opt/ghost-sphere
# and brings up the full stack (Postgres + Redis + engine + BFF + web).
# =============================================================================
set -euo pipefail

GHOST="\033[38;5;141m"; CYAN="\033[38;5;44m"; GREEN="\033[38;5;48m"; RED="\033[38;5;203m"; DIM="\033[2m"; NC="\033[0m"
GS_DIR="${GS_DIR:-/opt/ghost-sphere}"
REPO="${GS_REPO:-https://github.com/SKINOREZZZ101/SPHEREGHOST.git}"
PORT="${GHOST_SPHERE_PORT:-8080}"

banner() {
  echo -e "${GHOST}"
  echo "   ░██████╗ ░██████╗ ░█████╗  ░██████╗ ████████╗"
  echo "   ██╔════╝ ██╔════╝ ██╔══██╗ ██╔════╝ ╚══██╔══╝   Ghost Sphere"
  echo "   ██║  ██╗ ╚█████╗  ███████║ ╚█████╗     ██║      Installer · by Ghost OS"
  echo "   ╚██████╔╝ ██████╔╝██║  ██║ ██████╔╝    ██║"
  echo -e "    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝     ╚═╝${NC}\n"
}

log()  { echo -e "${CYAN}» $1${NC}"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
err()  { echo -e "${RED}✗ $1${NC}"; }

require_root() {
  if [ "$(id -u)" -ne 0 ]; then err "Run as root (sudo)."; exit 1; fi
}

cleanup_conflicts() {
  log "Removing conflicting container tooling (podman-docker / compose v1 / snap docker)…"
  apt-get remove -y podman-docker docker-compose >/dev/null 2>&1 || true
  snap remove docker >/dev/null 2>&1 || true
}

ensure_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    ok "Docker CE + Compose v2 already present."
    return
  fi
  log "Installing Docker CE + Compose v2 (get.docker.com)…"
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker >/dev/null 2>&1 || true
  if ! docker compose version >/dev/null 2>&1; then
    err "Docker Compose v2 not available after install. Aborting."
    exit 1
  fi
  ok "Docker is ready."
}

clone_repo() {
  if [ -d "$GS_DIR/.git" ]; then
    log "Updating existing install at ${GS_DIR}…"
    git -C "$GS_DIR" fetch --all --quiet
    git -C "$GS_DIR" reset --hard origin/main --quiet
  else
    log "Cloning Ghost Sphere to ${GS_DIR}…"
    rm -rf "$GS_DIR"
    git clone --depth 1 "$REPO" "$GS_DIR" >/dev/null 2>&1
  fi
  ok "Source ready."
}

launch() {
  cd "$GS_DIR"
  log "Building and starting the stack (first run takes 3–6 minutes)…"
  GHOST_SPHERE_PORT="$PORT" docker compose up -d --build
}

main() {
  banner
  require_root
  cleanup_conflicts
  ensure_docker
  command -v git >/dev/null 2>&1 || { log "Installing git…"; apt-get update -y >/dev/null && apt-get install -y git >/dev/null; }
  clone_repo
  launch

  local ip
  ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  echo
  ok "Ghost Sphere is starting."
  echo -e "${DIM}It needs a couple of minutes to migrate the database and boot.${NC}"
  echo -e "   Open:  ${GHOST}http://${ip:-<server-ip>}:${PORT}${NC}"
  echo -e "   Then:  Register tab → create the first admin (or Demo mode)."
  echo
  echo -e "${DIM}Status:  cd ${GS_DIR} && docker compose ps${NC}"
  echo -e "${DIM}Logs:    cd ${GS_DIR} && docker compose logs -f backend${NC}"
  echo -e "${DIM}Make sure TCP port ${PORT} is open in your firewall/cloud security group.${NC}"
}

main "$@"
