/** Generates the docker-compose.yml for a Ghost Sphere / Remnawave node. */
export function nodeDockerCompose(secretKey: string, port = 2222): string {
  return `services:
  ghost-sphere-node:
    image: remnawave/node:latest
    container_name: ghost-sphere-node
    hostname: ghost-sphere-node
    restart: always
    network_mode: host
    environment:
      - SECRET_KEY=${secretKey || '<SECRET_KEY>'}
      - NODE_PORT=${port}
    cap_add:
      - NET_ADMIN
`;
}

/** One-line installer command for a fresh server. */
export function nodeInstallCommand(secretKey: string): string {
  const key = secretKey || '<SECRET_KEY>';
  return `SECRET_KEY="${key}" bash <(curl -Ls https://raw.githubusercontent.com/SKINOREZZZ101/SPHEREGHOST/main/scripts/install-node.sh)`;
}
