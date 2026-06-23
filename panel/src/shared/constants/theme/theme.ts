import { createTheme } from '@mantine/core'

import { variantColorResolver } from './colors-resolver'
import components from './overrides'

export const theme = createTheme({
    variantColorResolver,
    components,
    cursorType: 'pointer',
    fontFamily:
        'Montserrat, Vazirmatn, Apple Color Emoji, Noto Sans SC, Twemoji Country Flags, sans-serif',
    fontFamilyMonospace: 'Fira Mono, monospace',
    breakpoints: {
        xs: '30em',
        sm: '40em',
        md: '48em',
        lg: '64em',
        xl: '80em',
        '2xl': '96em',
        '3xl': '120em',
        '4xl': '160em'
    },

    scale: 1,
    fontSmoothing: true,
    focusRing: 'never',
    white: '#ffffff',
    black: '#0A0C10',
    colors: {
        // Ghost OS "monochrome phantom" void scale (silver text on void black)
        dark: [
            '#E2E8F0',
            '#c2c8d4',
            '#9aa3b5',
            '#6e788c',
            '#2a3142',
            '#1A1F2E',
            '#141824',
            '#0A0C10',
            '#07090d',
            '#050609'
        ],
        // Ghost OS silver identity (primary)
        ghost: [
            '#ffffff',
            '#f1f3f6',
            '#e2e6ec',
            '#d3d8e1',
            '#C8CDD8',
            '#aab2c2',
            '#8d97a8',
            '#6f7a8e',
            '#56617a',
            '#3e4759'
        ],
        'shaded-gray': [
            '#f5f5f5',
            '#e8e8e8',
            '#d4d4d4',
            '#c0c0c0',
            '#a8a8a8',
            '#a0a0a0',
            '#808080',
            '#686868',
            '#505050',
            '#383838'
        ]
    },
    primaryShade: 4,
    primaryColor: 'ghost',
    autoContrast: true,
    luminanceThreshold: 0.3,
    headings: {
        fontWeight: '600'
    },
    defaultRadius: 'md'
})
