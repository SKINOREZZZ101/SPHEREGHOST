import { BadRequestException } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';

/** Credentials for the Remnawave panel a request is targeting. */
export interface PanelCreds {
  url: string;
  token: string;
  caddyToken?: string;
}

/**
 * Extracts the active panel connection from request headers. The Ghost Sphere
 * web client forwards these on every live-mode request, so the gateway stays
 * stateless and can serve multiple panels.
 */
export function panelFromHeaders(headers: IncomingHttpHeaders): PanelCreds {
  const url = headerValue(headers['x-gs-panel-url']);
  const token = headerValue(headers['x-gs-panel-token']);
  const caddyToken = headerValue(headers['x-gs-caddy-token']);

  if (!url || !token) {
    throw new BadRequestException(
      'Missing panel connection headers (X-GS-Panel-Url / X-GS-Panel-Token).',
    );
  }
  return { url: normalizeUrl(url), token, caddyToken: caddyToken || undefined };
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizeUrl(url: string): string {
  let u = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
}
