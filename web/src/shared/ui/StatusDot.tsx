import { Box, Group, Text } from '@mantine/core';

const COLORS: Record<string, string> = {
  connected: '#22ff7c',
  online: '#22ff7c',
  operational: '#22ff7c',
  healthy: '#22ff7c',
  success: '#22ff7c',
  connecting: '#ffa121',
  degraded: '#ffa121',
  pending: '#ffa121',
  warning: '#ffa121',
  disconnected: '#ff4d6d',
  down: '#ff4d6d',
  error: '#ff4d6d',
  unhealthy: '#ff4d6d',
  disabled: '#6e7186',
  offline: '#6e7186',
  inactive: '#6e7186',
};

interface StatusDotProps {
  status: string;
  label?: string;
  pulse?: boolean;
  size?: number;
}

export function StatusDot({ status, label, pulse, size = 9 }: StatusDotProps) {
  const color = COLORS[status] ?? '#6e7186';
  return (
    <Group gap={8} wrap="nowrap" align="center">
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}aa`,
          animation: pulse ? 'gs-pulse 2s infinite' : undefined,
          flexShrink: 0,
        }}
      />
      {label && (
        <Text fz="sm" c="dimmed">
          {label}
        </Text>
      )}
    </Group>
  );
}
