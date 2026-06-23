import axios, { type AxiosInstance } from 'axios';
import { APP } from '@shared/config';
import { useSession } from '@entities/session/session.store';

/**
 * Axios instance pointed at the Ghost Sphere Core gateway.
 * In "live" mode the active panel connection (URL + token) is forwarded as
 * headers, so the gateway proxies to the correct Remnawave panel.
 */
export const http: AxiosInstance = axios.create({
  baseURL: APP.apiBase,
  timeout: 30_000,
});

http.interceptors.request.use((config) => {
  const { mode, connection } = useSession.getState();
  if (mode === 'live' && connection) {
    config.headers.set('X-GS-Panel-Url', connection.url);
    config.headers.set('X-GS-Panel-Token', connection.token);
    if (connection.caddyToken) config.headers.set('X-GS-Caddy-Token', connection.caddyToken);
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      // Token rejected by the panel — drop the session.
      useSession.getState().logout();
    }
    return Promise.reject(error);
  },
);

/** Tiny delay used to make demo interactions feel responsive but real. */
export const demoDelay = (ms = 160) => new Promise((r) => setTimeout(r, ms));
