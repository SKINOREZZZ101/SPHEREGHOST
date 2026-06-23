import {
  createTheme,
  rem,
  type CSSVariablesResolver,
  type MantineThemeOverride,
} from '@mantine/core';
import { ember, ghost, ink, plasma, spectre, toxic } from './colors';

const fontStack =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif";
// Ghost OS uses Inter for headings too (tight negative tracking, applied in global.css).
const displayStack = "'Inter', system-ui, -apple-system, sans-serif";
const monoStack = "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', ui-monospace, monospace";

export const theme: MantineThemeOverride = createTheme({
  primaryColor: 'ghost',
  primaryShade: { light: 6, dark: 3 },
  autoContrast: true,
  luminanceThreshold: 0.45,
  colors: {
    ghost,
    spectre,
    plasma,
    toxic,
    ember,
    dark: ink,
  },
  fontFamily: fontStack,
  fontFamilyMonospace: monoStack,
  headings: {
    fontFamily: displayStack,
    fontWeight: '650',
    sizes: {
      h1: { fontSize: rem(30), lineHeight: '1.2', fontWeight: '700' },
      h2: { fontSize: rem(24), lineHeight: '1.25', fontWeight: '680' },
      h3: { fontSize: rem(19), lineHeight: '1.3', fontWeight: '650' },
      h4: { fontSize: rem(16), lineHeight: '1.35', fontWeight: '620' },
    },
  },
  defaultRadius: 'md',
  radius: {
    xs: rem(6),
    sm: rem(9),
    md: rem(13),
    lg: rem(18),
    xl: rem(26),
  },
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(22),
    xl: rem(32),
  },
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.4)',
    sm: '0 2px 10px rgba(0,0,0,0.45)',
    md: '0 10px 32px rgba(0,0,0,0.5)',
    lg: '0 20px 56px rgba(0,0,0,0.55)',
    xl: '0 32px 90px rgba(0,0,0,0.6)',
  },
  cursorType: 'pointer',
  focusRing: 'never',
  other: {
    glow: '0 0 0 1px rgba(200,205,216,0.18), 0 18px 50px rgba(200,205,216,0.10)',
    glowSpectre: '0 0 0 1px rgba(148,163,184,0.18), 0 18px 50px rgba(148,163,184,0.10)',
  },
  components: {
    Paper: {
      defaultProps: { radius: 'lg' },
    },
    Card: {
      defaultProps: { radius: 'lg', withBorder: true },
    },
    Button: {
      defaultProps: { radius: 'md' },
      styles: { root: { fontWeight: 600, letterSpacing: '0.01em' } },
    },
    ActionIcon: {
      defaultProps: { radius: 'md' },
    },
    Badge: {
      defaultProps: { radius: 'sm' },
      styles: { root: { fontWeight: 650, letterSpacing: '0.02em' } },
    },
    Tooltip: {
      defaultProps: { radius: 'md', withArrow: true, openDelay: 200 },
    },
    Modal: {
      defaultProps: { radius: 'lg', centered: true, overlayProps: { blur: 6, backgroundOpacity: 0.6 } },
    },
    Drawer: {
      defaultProps: { radius: 'lg', overlayProps: { blur: 6, backgroundOpacity: 0.55 } },
    },
    Input: {
      defaultProps: { radius: 'md' },
    },
    TextInput: { defaultProps: { radius: 'md' } },
    PasswordInput: { defaultProps: { radius: 'md' } },
    Select: { defaultProps: { radius: 'md' } },
    Textarea: { defaultProps: { radius: 'md' } },
    Tabs: {
      styles: { tab: { fontWeight: 600 } },
    },
    Notification: {
      defaultProps: { radius: 'md' },
    },
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    '--gs-bg': '#0A0C10',
    '--gs-bg-deep': '#07090d',
    '--gs-surface': '#141824',
    '--gs-surface-alt': '#1A1F2E',
    '--gs-elevated': '#1A1F2E',
    '--gs-border': 'rgba(255,255,255,0.06)',
    '--gs-border-strong': 'rgba(255,255,255,0.12)',
    '--gs-ghost': '#C8CDD8',
    '--gs-spectre': '#94A3B8',
    '--gs-plasma': '#a78bfa',
    '--gs-toxic': '#2EE5A3',
    '--gs-ember': '#fbbf24',
    '--gs-text-dim': '#94A3B8',
    '--gs-font-display': displayStack,
    '--gs-font-mono': monoStack,
  },
  light: {
    '--gs-text': '#1b1c24',
  },
  dark: {
    '--gs-text': '#E2E8F0',
    '--mantine-color-body': '#0A0C10',
  },
});
