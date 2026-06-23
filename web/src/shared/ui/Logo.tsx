import { Box, Text } from '@mantine/core';

interface LogoProps {
  size?: number;
  withText?: boolean;
  animated?: boolean;
}

/** The Ghost Sphere brand mark: a spectral orb cradling a ghost silhouette. */
export function GhostSphereMark({ size = 36, animated = true }: { size?: number; animated?: boolean }) {
  return (
    <Box
      style={{
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
        filter: 'drop-shadow(0 0 10px rgba(124,92,255,0.45))',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="gs-mark" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a288f1" />
            <stop offset="0.5" stopColor="#7c5cff" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <radialGradient id="gs-core" cx="0.5" cy="0.4" r="0.6">
            <stop stopColor="#14141d" />
            <stop offset="1" stopColor="#07070b" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="29" fill="url(#gs-core)" stroke="url(#gs-mark)" strokeWidth="2.5" />
        <ellipse
          cx="32"
          cy="32"
          rx="29"
          ry="11"
          fill="none"
          stroke="url(#gs-mark)"
          strokeWidth="1.4"
          opacity="0.4"
          style={
            animated
              ? { transformOrigin: 'center', animation: 'gs-spin-slow 9s linear infinite' }
              : undefined
          }
        />
        <path
          d="M32 16c-7.2 0-13 5.8-13 13v17c0 1.4 1.6 2.2 2.7 1.3l2.6-2.1a2 2 0 0 1 2.6 0l2.2 1.9a2 2 0 0 0 2.6 0l2.2-1.9a2 2 0 0 1 2.6 0l2.6 2.1c1.1.9 2.7.1 2.7-1.3V29c0-7.2-5.8-13-13-13z"
          fill="url(#gs-mark)"
        />
        <circle cx="27" cy="29" r="2.4" fill="#07070b" />
        <circle cx="37" cy="29" r="2.4" fill="#07070b" />
      </svg>
    </Box>
  );
}

export function Logo({ size = 36, withText = true, animated = true }: LogoProps) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <GhostSphereMark size={size} animated={animated} />
      {withText && (
        <Box>
          <Text
            fw={750}
            fz={size * 0.5}
            lh={1.05}
            style={{ fontFamily: 'var(--gs-font-display)', letterSpacing: '-0.01em' }}
          >
            <span className="gs-gradient-text">Ghost</span> Sphere
          </Text>
          <Text fz={size * 0.26} c="dimmed" lh={1} mt={2} tt="uppercase" style={{ letterSpacing: '0.22em' }}>
            by Ghost OS
          </Text>
        </Box>
      )}
    </Box>
  );
}
