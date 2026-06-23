import { Box, Group, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  trend?: number;
  accent?: string;
  delay?: number;
  spark?: ReactNode;
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  trend,
  accent = 'var(--gs-ghost)',
  delay = 0,
  spark,
}: StatCardProps) {
  return (
    <GlassCard delay={delay} interactive p="md" style={{ overflow: 'hidden', position: 'relative' }}>
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(420px circle at 100% 0%, ${accent}14, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4} style={{ minWidth: 0 }}>
          <Text fz="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: '0.08em' }}>
            {label}
          </Text>
          <Text fz={28} fw={720} lh={1.1} style={{ fontFamily: 'var(--gs-font-display)' }}>
            {value}
          </Text>
          {(hint || trend != null) && (
            <Group gap={6} mt={2}>
              {trend != null && (
                <Text fz="xs" fw={700} c={trend >= 0 ? 'toxic.4' : 'red.4'}>
                  {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
                </Text>
              )}
              {hint && (
                <Text fz="xs" c="dimmed">
                  {hint}
                </Text>
              )}
            </Group>
          )}
        </Stack>
        {icon && (
          <Box
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              color: accent,
              background: `${accent}1a`,
              border: `1px solid ${accent}33`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
      </Group>
      {spark && <Box mt="sm">{spark}</Box>}
    </GlassCard>
  );
}
