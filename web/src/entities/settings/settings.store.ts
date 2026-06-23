import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@shared/config';

export type AccentColor = 'ghost' | 'spectre' | 'plasma' | 'toxic' | 'ember';
export type Density = 'comfortable' | 'compact';

interface SettingsState {
  accent: AccentColor;
  density: Density;
  animations: boolean;
  glow: boolean;
  grain: boolean;
  pollIntervalSec: number;
  set: <K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) => void;
  reset: () => void;
}

type SettingsValues = Pick<
  SettingsState,
  'accent' | 'density' | 'animations' | 'glow' | 'grain' | 'pollIntervalSec'
>;

const defaults: SettingsValues = {
  accent: 'ghost',
  density: 'comfortable',
  animations: true,
  glow: true,
  grain: true,
  pollIntervalSec: 10,
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      set: (key, value) => set({ [key]: value } as Partial<SettingsState>),
      reset: () => set({ ...defaults }),
    }),
    { name: STORAGE_KEYS.settings },
  ),
);
