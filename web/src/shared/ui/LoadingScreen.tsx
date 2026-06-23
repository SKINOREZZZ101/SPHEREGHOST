import { Box, Stack, Text } from '@mantine/core';
import { GhostSphereMark } from './Logo';

export function LoadingScreen({ label }: { label?: string }) {
  return (
    <Box style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <Stack align="center" gap="md">
        <Box style={{ animation: 'gs-pulse 1.6s infinite' }}>
          <GhostSphereMark size={56} />
        </Box>
        <Text c="dimmed" fz="sm">
          {label ?? 'Ghost Sphere…'}
        </Text>
      </Stack>
    </Box>
  );
}
