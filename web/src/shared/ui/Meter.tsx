import { Box, Group, Text } from '@mantine/core';

interface MeterProps {
  value: number; // 0..100
  label?: string;
  right?: string;
  color?: string;
  height?: number;
}

/** Thin gradient progress meter with optional caption. */
export function Meter({ value, label, right, color = 'var(--gs-ghost)', height = 7 }: MeterProps) {
  const pct = Math.max(0, Math.min(100, value));
  const danger = pct > 90;
  const fill = danger ? '#ff4d6d' : color;
  return (
    <Box>
      {(label || right) && (
        <Group justify="space-between" mb={6}>
          {label && (
            <Text fz="xs" c="dimmed">
              {label}
            </Text>
          )}
          {right && (
            <Text fz="xs" fw={600}>
              {right}
            </Text>
          )}
        </Group>
      )}
      <Box
        style={{
          height,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${fill}, ${fill}cc)`,
            boxShadow: `0 0 12px ${fill}66`,
            transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
      </Box>
    </Box>
  );
}
