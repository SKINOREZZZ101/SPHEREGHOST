import type { MantineColorsTuple } from '@mantine/core';

/**
 * Ghost OS "monochrome phantom" palette (ported from INFO GHOST OS).
 * The identity is void-black + silver, not neon. Functional accents
 * (green/amber/red) match the Ghost OS site.
 *
 * "ghost"   — silver, the primary identity color.
 * "spectre" — cool slate, used for gradient depth and secondary accents.
 * "plasma"  — muted phantom violet (used sparingly, SPECTRAL sub-brand).
 * "toxic"   — Ghost OS green for success / online states.
 * "ember"   — amber for warnings.
 */

export const ghost: MantineColorsTuple = [
  '#f5f6f9',
  '#e9ebf0',
  '#d8dce4',
  '#C8CDD8', // ← the signature silver accent
  '#b3bac8',
  '#9aa3b5',
  '#8d97a8',
  '#6c7689',
  '#535d70',
  '#3c4456',
];

export const spectre: MantineColorsTuple = [
  '#eef1f6',
  '#dde3ec',
  '#c3ccd9',
  '#a6b1c2',
  '#8794a8',
  '#64748b', // slate
  '#515f73',
  '#414d5e',
  '#333d4b',
  '#27303c',
];

export const plasma: MantineColorsTuple = [
  '#f1edff',
  '#e0d8fb',
  '#c4b6f3',
  '#a78bfa', // phantom violet (SPECTRAL accent)
  '#9173f0',
  '#8460e8',
  '#7a52e3',
  '#6841cf',
  '#5c39b8',
  '#4d2fa0',
];

export const toxic: MantineColorsTuple = [
  '#dcfff1',
  '#b9ffe2',
  '#83f7cd',
  '#4fefb8',
  '#2EE5A3', // Ghost OS green
  '#1fd494',
  '#0fc285',
  '#00a972',
  '#009160',
  '#00794f',
];

export const ember: MantineColorsTuple = [
  '#fff5e0',
  '#ffe9c2',
  '#ffd28a',
  '#ffbd54',
  '#fbbf24', // Ghost OS amber
  '#f0ad14',
  '#e09a06',
  '#c08400',
  '#a06f00',
  '#855c00',
];

/** Void-black neutral scale for surfaces, borders and text. */
export const ink: MantineColorsTuple = [
  '#E2E8F0', // 0 — bright text
  '#cbd2df', // 1
  '#94A3B8', // 2 — secondary text
  '#64748B', // 3 — muted
  '#2a3142', // 4 — border (lightened)
  '#1A1F2E', // 5 — elevated / hover
  '#141824', // 6 — card surface
  '#0A0C10', // 7 — body background
  '#070910', // 8
  '#04050a', // 9 — deepest
];

/** Raw tokens used outside Mantine's color system. */
export const tokens = {
  bg: '#0A0C10',
  bgDeep: '#07090d',
  surface: '#141824',
  surfaceAlt: '#1A1F2E',
  elevated: '#1A1F2E',
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.12)',
  ghost: '#C8CDD8',
  ghostSoft: 'rgba(200,205,216,0.10)',
  spectre: '#94A3B8',
  spectreSoft: 'rgba(148,163,184,0.10)',
  plasma: '#a78bfa',
  toxic: '#2EE5A3',
  ember: '#fbbf24',
  danger: '#f87171',
  textBright: '#E2E8F0',
  text: '#C8CDD8',
  textDim: '#94A3B8',
} as const;

export const gradients = {
  // The signature Ghost OS silver 3-stop.
  ghost: 'linear-gradient(135deg, #C8CDD8 0%, #a0a5b5 50%, #64748b 100%)',
  ghostSoft: 'linear-gradient(135deg, rgba(200,205,216,0.18), rgba(148,163,184,0.10))',
  spectre: 'linear-gradient(135deg, #94A3B8 0%, #64748b 100%)',
  plasma: 'linear-gradient(135deg, #a78bfa 0%, #64748b 100%)',
  toxic: 'linear-gradient(135deg, #2EE5A3 0%, #64748b 100%)',
  ember: 'linear-gradient(135deg, #fbbf24 0%, #a0a5b5 100%)',
  // Heading text gradient (white → silver), from the Ghost OS site.
  heading: 'linear-gradient(180deg, #ffffff 0%, #a0a5b5 100%)',
  // Soft silver ambient glow (matches body::before on the site).
  aurora:
    'radial-gradient(ellipse 60% 40% at 30% -10%, rgba(255,255,255,0.045), transparent 60%), radial-gradient(ellipse 50% 30% at 72% -4%, rgba(200,205,216,0.035), transparent 60%), radial-gradient(ellipse 44% 30% at 50% 8%, rgba(160,165,181,0.025), transparent 60%)',
} as const;
