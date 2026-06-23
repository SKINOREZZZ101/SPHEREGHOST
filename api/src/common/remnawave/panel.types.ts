import type { IncomingHttpHeaders } from 'http';

/** Connection to the bundled Ghost Sphere Engine for the current request. */
export interface PanelCreds {
  url: string;
  token: string;
  caddyToken?: string;
}

/** The local engine URL (set in compose: ENGINE_URL=http://backend:3000). */
export function engineUrl(): string {
  return (process.env.ENGINE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
}

/**
 * Resolves the engine connection for a request. The web client logs into the
 * engine and sends its JWT as `Authorization: Bearer <jwt>`; the BFF forwards
 * it to the local engine. No external panel is involved — the engine is ours.
 */
export function panelFromHeaders(headers: IncomingHttpHeaders): PanelCreds {
  const authHeader = headerValue(headers['authorization']) || '';
  const bearer = authHeader.replace(/^Bearer\s+/i, '').trim();
  const token = bearer || headerValue(headers['x-gs-panel-token']) || '';
  return { url: engineUrl(), token };
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
