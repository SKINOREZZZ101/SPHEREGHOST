import { Box, Group, Text } from '@mantine/core';

const COLORS: Record<string, string> = {
  connected: '#2EE5A3',
  online: '#2EE5A3',
  operational: '#2EE5A3',
  healthy: '#2EE5A3',
  success: '#2EE5A3',
  connecting: '#fbbf24',
  degraded: '#fbbf24',
  pending: '#fbbf24',
  warning: '#fbbf24',
  disconnected: '#f87171',
  down: '#f87171',
  error: '#f87171',
  unhealthy: '#f87171',
  disabled: '#64748B',
  offline: '#64748B',
  inactive: '#64748B',
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
