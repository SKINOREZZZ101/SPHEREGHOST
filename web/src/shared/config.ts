// Global Ghost Sphere client configuration.
export const APP = {
  name: 'Ghost Sphere',
  shortName: 'Sphere',
  vendor: 'Ghost OS',
  version: (import.meta.env.VITE_APP_VERSION as string) || '0.0.1',
  // Ghost Sphere Core (NestJS gateway). In dev, Vite proxies /api to it.
  apiBase: (import.meta.env.VITE_API_BASE as string) || '/api',
  repo: 'https://github.com/ghost-os/ghost-sphere',
  docs: 'https://ghost-os.dev/sphere',
} as const;

export const STORAGE_KEYS = {
  session: 'gs.session.v1',
  settings: 'gs.settings.v1',
  lang: 'gs.lang',
  tablePrefs: 'gs.table.v1',
} as const;
