import { Box, Button, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { GhostSphereMark } from './Logo';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void; icon?: ReactNode };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Stack align="center" gap="md" py={64} px="md">
      <Box style={{ opacity: 0.85 }}>{icon ?? <GhostSphereMark size={72} />}</Box>
      <Stack align="center" gap={6} maw={460}>
        <Text fz="lg" fw={680} ta="center" style={{ fontFamily: 'var(--gs-font-display)' }}>
          {title}
        </Text>
        {description && (
          <Text c="dimmed" fz="sm" ta="center">
            {description}
          </Text>
        )}
      </Stack>
      {action && (
        <Button
          mt="xs"
          leftSection={action.icon}
          onClick={action.onClick}
          variant="gradient"
          gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
        >
          {action.label}
        </Button>
      )}
    </Stack>
  );
}
