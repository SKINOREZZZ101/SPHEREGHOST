import { Box, Text } from '@mantine/core';

interface GhostLoaderProps {
  size?: number;
  label?: string;
}

/**
 * Premium floating-ghost loader (Ghost OS style): a silver ghost that hovers
 * with a glowing aura over a breathing shadow, with bouncing dots underneath.
 */
export function GhostLoader({ size = 96, label }: GhostLoaderProps) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
      <Box style={{ position: 'relative', width: size, height: size * 1.15 }}>
        <Box className="gs-ghost-float" style={{ position: 'relative', zIndex: 1 }}>
          <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="gs-loader" x1="18" y1="10" x2="46" y2="54" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="0.55" stopColor="#C8CDD8" />
                <stop offset="1" stopColor="#8d97a8" />
              </linearGradient>
            </defs>
            <path
              d="M32 11c-9.4 0-17 7.6-17 17v20.5c0 1.9 2.2 2.9 3.7 1.7l3.4-2.8a2.6 2.6 0 0 1 3.3 0l3 2.5a2.6 2.6 0 0 0 3.2 0l3-2.5a2.6 2.6 0 0 1 3.3 0l3.4 2.8c1.5 1.2 3.7.2 3.7-1.7V28c0-9.4-7.6-17-17-17z"
              fill="url(#gs-loader)"
            />
            <circle cx="25.5" cy="28" r="3.1" fill="#0A0C10" />
            <circle cx="38.5" cy="28" r="3.1" fill="#0A0C10" />
          </svg>
        </Box>
        <Box className="gs-ghost-shadow" />
      </Box>

      <Box style={{ display: 'flex', gap: 7 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#C8CDD8',
              animation: `gs-dot-bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
            }}
          />
        ))}
      </Box>

      {label && (
        <Text className="gs-gradient-text" fz="sm" fw={600} style={{ letterSpacing: '0.18em' }}>
          {label}
        </Text>
      )}
    </Box>
  );
}
