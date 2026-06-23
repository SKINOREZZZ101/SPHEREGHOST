import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@shared/config';

export type SphereMode = 'demo' | 'live';

export interface PanelConnection {
  id: string;
  name: string;
  url: string;
  token: string;
  caddyToken?: string;
}

interface SessionState {
  mode: SphereMode | null;
  authenticated: boolean;
  connection: PanelConnection | null;
  hydrated: boolean;
  loginDemo: () => void;
  loginLive: (conn: Omit<PanelConnection, 'id'>) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      mode: null,
      authenticated: false,
      connection: null,
      hydrated: false,
      loginDemo: () =>
        set({
          mode: 'demo',
          authenticated: true,
          connection: {
            id: 'demo',
            name: 'Ghost Demo Sphere',
            url: 'demo://sphere',
            token: 'demo',
          },
        }),
      loginLive: (conn) =>
        set({
          mode: 'live',
          authenticated: true,
          connection: { ...conn, id: crypto.randomUUID() },
        }),
      logout: () => set({ mode: null, authenticated: false, connection: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: STORAGE_KEYS.session,
      partialize: (s) => ({ mode: s.mode, authenticated: s.authenticated, connection: s.connection }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

export const isDemo = () => useSession.getState().mode === 'demo';
