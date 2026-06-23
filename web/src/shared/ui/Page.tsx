import { Box, Group, Stack, Text, Title } from '@mantine/core';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useSettings } from '@entities/settings/settings.store';

interface PageProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function Page({ title, subtitle, icon, actions, children }: PageProps) {
  const animations = useSettings((s) => s.animations);
  return (
    <motion.div
      initial={animations ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <Group gap="md" wrap="nowrap" align="center">
            {icon && (
              <Box
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, rgba(124,92,255,0.2), rgba(34,211,238,0.12))',
                  border: '1px solid var(--gs-border)',
                  color: 'var(--gs-ghost)',
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              <Title order={1}>{title}</Title>
              {subtitle && (
                <Text c="dimmed" fz="sm" mt={2}>
                  {subtitle}
                </Text>
              )}
            </Box>
          </Group>
          {actions && <Group gap="sm">{actions}</Group>}
        </Group>
        <Box>{children}</Box>
      </Stack>
    </motion.div>
  );
}
