import type { MantineColorsTuple } from '@mantine/core';

/**
 * Ghost OS palette.
 * "ghost"   — the spectral violet identity color (primary).
 * "spectre" — cyan/teal energy accent (secondary).
 * "plasma"  — magenta/pink for highlights and danger-adjacent accents.
 * "toxic"   — green for success / online states.
 * "ember"   — amber for warnings.
 */

export const ghost: MantineColorsTuple = [
  '#f3effe',
  '#e2dcfb',
  '#c3b5f6',
  '#a288f1',
  '#8765ed',
  '#7650eb',
  '#6d45ea',
  '#5c36d0',
  '#512fbb',
  '#4527a4',
];

export const spectre: MantineColorsTuple = [
  '#e0fdff',
  '#cbf6fb',
  '#9aebf3',
  '#65e0ec',
  '#3bd8e6',
  '#22d3e2',
  '#0fcfe0',
  '#00b6c7',
  '#00a2b2',
  '#008b9c',
];

export const plasma: MantineColorsTuple = [
  '#ffe9fb',
  '#ffd1f2',
  '#fba1e0',
  '#f76dcd',
  '#f343bd',
  '#f129b3',
  '#f018ae',
  '#d60898',
  '#bf0088',
  '#a80076',
];

export const toxic: MantineColorsTuple = [
  '#e3fff1',
  '#caffe2',
  '#99ffc4',
  '#63ffa4',
  '#3bff8b',
  '#22ff7c',
  '#0bff72',
  '#00e361',
  '#00c953',
  '#00ad44',
];

export const ember: MantineColorsTuple = [
  '#fff6e0',
  '#ffeccb',
  '#ffd699',
  '#ffc066',
  '#ffad3b',
  '#ffa121',
  '#ff9a10',
  '#e38500',
  '#cb7600',
  '#b16400',
];

/** Deep-space neutral scale used for surfaces, borders and text in dark mode. */
export const ink: MantineColorsTuple = [
  '#e6e7ee',
  '#c2c4d2',
  '#9b9eb2',
  '#6e7186',
  '#2a2c39',
  '#191a24',
  '#0f1017',
  '#07070b',
  '#050509',
  '#020203',
];

/** Raw hex tokens used outside Mantine's color system (gradients, shadows, canvas). */
export const tokens = {
  bg: '#07070b',
  bgDeep: '#050509',
  surface: '#0f1017',
  surfaceAlt: '#13141d',
  elevated: '#191a24',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.12)',
  ghost: '#7c5cff',
  ghostSoft: 'rgba(124,92,255,0.16)',
  spectre: '#22d3ee',
  spectreSoft: 'rgba(34,211,238,0.14)',
  plasma: '#f129b3',
  toxic: '#22ff7c',
  ember: '#ffa121',
  danger: '#ff4d6d',
  textBright: '#f2f2f7',
  text: '#c7c8d6',
  textDim: '#8a8ca0',
} as const;

export const gradients = {
  ghost: 'linear-gradient(135deg, #7c5cff 0%, #a288f1 50%, #22d3ee 100%)',
  ghostSoft: 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(34,211,238,0.16))',
  spectre: 'linear-gradient(135deg, #22d3ee 0%, #0fcfe0 100%)',
  plasma: 'linear-gradient(135deg, #f129b3 0%, #7c5cff 100%)',
  toxic: 'linear-gradient(135deg, #22ff7c 0%, #0fcfe0 100%)',
  ember: 'linear-gradient(135deg, #ffa121 0%, #f129b3 100%)',
  aurora:
    'radial-gradient(1200px circle at 12% -10%, rgba(124,92,255,0.22), transparent 45%), radial-gradient(1000px circle at 92% 8%, rgba(34,211,238,0.16), transparent 45%), radial-gradient(900px circle at 60% 120%, rgba(241,41,179,0.10), transparent 50%)',
} as const;
