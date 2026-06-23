import {
  Badge,
  Box,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconActivityHeartbeat,
  IconBox,
  IconBrandCloudflare,
  IconCloud,
  IconCpu,
  IconDatabaseExport,
  IconPuzzle,
  IconRobotFace,
  IconShoppingBag,
  type Icon,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { StatusDot } from '@shared/ui/StatusDot';
import { useIntegrations, useToggleIntegration } from '@shared/api/hooks';
import type { GsIntegration, IntegrationCategory } from '@shared/api/types';

const META: Record<string, { icon: Icon; accent: string }> = {
  minishop: { icon: IconShoppingBag, accent: '#22ff7c' },
  adminBot: { icon: IconRobotFace, accent: '#7c5cff' },
  cloudflare: { icon: IconCloud, accent: '#ffa121' },
  xrayChecker: { icon: IconActivityHeartbeat, accent: '#22d3ee' },
  whitebox: { icon: IconBox, accent: '#a288f1' },
  mcp: { icon: IconCpu, accent: '#f129b3' },
  backupBot: { icon: IconDatabaseExport, accent: '#22d3ee' },
  warp: { icon: IconBrandCloudflare, accent: '#ffa121' },
};

const CATEGORIES: { key: IntegrationCategory; labelKey: string }[] = [
  { key: 'bots', labelKey: 'integrations.catBots' },
  { key: 'monitoring', labelKey: 'integrations.catMonitoring' },
  { key: 'infra', labelKey: 'integrations.catInfra' },
  { key: 'automation', labelKey: 'integrations.catAutomation' },
];

export default function IntegrationsPage() {
  const { t } = useTranslation();
  const { data: integrations = [] } = useIntegrations();

  const healthy = integrations.filter((i) => i.healthy).length;

  return (
    <Page
      title={t('integrations.title')}
      subtitle={t('integrations.subtitle')}
      icon={<IconPuzzle size={24} />}
      actions={
        <Badge size="lg" variant="light" color="toxic">
          {t('integrations.healthyCount', { healthy, total: integrations.length })}
        </Badge>
      }
    >
      <Stack gap="xl">
        {CATEGORIES.map((cat) => {
          const items = integrations.filter((i) => i.category === cat.key);
          if (!items.length) return null;
          return (
            <Box key={cat.key}>
              <Text fz="sm" fw={700} c="dimmed" tt="uppercase" mb="sm" style={{ letterSpacing: '0.1em' }}>
                {t(cat.labelKey)}
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {items.map((it, i) => (
                  <IntegrationCard key={it.id} integration={it} delay={i * 0.04} />
                ))}
              </SimpleGrid>
            </Box>
          );
        })}
      </Stack>
    </Page>
  );
}

function IntegrationCard({ integration, delay }: { integration: GsIntegration; delay: number }) {
  const { t } = useTranslation();
  const toggle = useToggleIntegration();
  const meta = META[integration.key] ?? { icon: IconPuzzle, accent: '#7c5cff' };
  const Icon = meta.icon;
  const connected = integration.status === 'connected';

  return (
    <GlassCard delay={delay} interactive glow={connected ? 'none' : 'none'}>
      <Group justify="space-between" align="flex-start">
        <Box
          style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            background: `${meta.accent}1a`,
            border: `1px solid ${meta.accent}33`,
            color: meta.accent,
          }}
        >
          <Icon size={26} stroke={1.7} />
        </Box>
        <StatusDot status={connected ? 'connected' : 'offline'} pulse={connected} />
      </Group>

      <Title order={4} fz="md" mt="md">
        {t(`integrations.${integration.key}`)}
      </Title>
      <Text fz="sm" c="dimmed" mt={4} lineClamp={2} style={{ minHeight: 40 }}>
        {t(`integrations.${integration.key}Desc`)}
      </Text>

      <Group justify="space-between" mt="md">
        <Group gap={6}>
          {integration.endpoint && (
            <Badge size="sm" variant="default" radius="sm" style={{ fontFamily: 'var(--gs-font-mono)' }}>
              {integration.endpoint}
            </Badge>
          )}
          {integration.meta &&
            Object.entries(integration.meta).map(([k, v]) => (
              <Badge key={k} size="sm" variant="light" color="spectre" radius="sm">
                {k}: {v}
              </Badge>
            ))}
        </Group>
      </Group>

      <Button
        fullWidth
        mt="md"
        variant={connected ? 'default' : 'gradient'}
        gradient={connected ? undefined : { from: 'ghost.6', to: 'spectre.5', deg: 135 }}
        onClick={() =>
          toggle.mutate(integration.id, {
            onSuccess: () =>
              notifications.show({
                message: connected ? t('integrations.disconnect') : t('integrations.connected'),
                color: connected ? 'gray' : 'teal',
              }),
          })
        }
      >
        {connected ? t('integrations.disconnect') : t('integrations.connect')}
      </Button>
    </GlassCard>
  );
}
