import { HttpException, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, type AxiosInstance, type Method } from 'axios';
import type { PanelCreds } from './panel.types';

/**
 * Thin, resilient client for the Remnawave panel REST API (/api/*).
 * Builds a per-request axios instance from the forwarded panel credentials
 * and unwraps the Remnawave `{ response }` envelope.
 */
@Injectable()
export class RemnawaveService {
  private readonly logger = new Logger('Remnawave');

  private client(creds: PanelCreds): AxiosInstance {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${creds.token}`,
      'X-Remnawave-Client-Type': 'browser',
      'Content-Type': 'application/json',
      // The engine's ProxyCheckMiddleware requires a reverse-proxy + HTTPS:
      // it needs X-Forwarded-For present AND X-Forwarded-Proto === 'https'.
      // The BFF is the trusted internal proxy in front of the engine.
      'X-Forwarded-Proto': 'https',
      'X-Forwarded-For': '127.0.0.1',
    };
    if (creds.caddyToken) headers['X-Api-Key'] = creds.caddyToken;
    return axios.create({
      baseURL: `${creds.url}/api`,
      headers,
      timeout: 25_000,
      // Allow self-signed panel certs behind a reverse proxy.
      validateStatus: (s) => s < 500,
    });
  }

  async request<T = unknown>(
    creds: PanelCreds,
    method: Method,
    path: string,
    data?: unknown,
  ): Promise<T> {
    try {
      const res = await this.client(creds).request({ method, url: path, data });
      if (res.status >= 400) {
        const body = res.data as { message?: string | string[] } | string | undefined;
        let msg: string | undefined;
        if (body && typeof body === 'object') {
          msg = Array.isArray(body.message) ? body.message.join('; ') : body.message;
        } else if (typeof body === 'string') {
          msg = body;
        }
        this.logger.warn(
          `${method} ${path} -> ${res.status}: ${JSON.stringify(res.data)?.slice(0, 400)}`,
        );
        throw new HttpException(msg ?? `Engine responded ${res.status}`, res.status);
      }
      const body = res.data as { response?: T } | T;
      if (body && typeof body === 'object' && 'response' in body) {
        return (body as { response: T }).response;
      }
      return body as T;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      const ax = err as AxiosError;
      this.logger.warn(`${method} ${path} failed: ${ax.message}`);
      throw new HttpException(
        `Remnawave panel unreachable: ${ax.message}`,
        ax.response?.status ?? 502,
      );
    }
  }

  get<T = unknown>(creds: PanelCreds, path: string) {
    return this.request<T>(creds, 'GET', path);
  }
  post<T = unknown>(creds: PanelCreds, path: string, data?: unknown) {
    return this.request<T>(creds, 'POST', path, data);
  }
  patch<T = unknown>(creds: PanelCreds, path: string, data?: unknown) {
    return this.request<T>(creds, 'PATCH', path, data);
  }
  delete<T = unknown>(creds: PanelCreds, path: string) {
    return this.request<T>(creds, 'DELETE', path);
  }
}
