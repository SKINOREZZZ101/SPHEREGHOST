import { Badge, Box, Button, Group, SimpleGrid, Stack, Switch, Text } from '@mantine/core';
import { IconCirclePlus, IconPlugConnected, IconShieldCheckered } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { EmptyState } from '@shared/ui/EmptyState';
import { useHosts } from '@shared/api/hooks';
import type { GsHost } from '@shared/api/types';

const SECURITY_COLOR: Record<GsHost['security'], string> = {
  reality: '#7c5cff',
  tls: '#22d3ee',
  none: '#9b9eb2',
};

export default function HostsPage() {
  const { t } = useTranslation();
  const { data: hosts = [] } = useHosts();

  return (
    <Page
      title={t('hosts.title')}
      subtitle={t('hosts.subtitle')}
      icon={<IconPlugConnected size={24} />}
      actions={
        <Button
          leftSection={<IconCirclePlus size={16} />}
          variant="gradient"
          gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
        >
          {t('hosts.add')}
        </Button>
      }
    >
      {hosts.length === 0 ? (
        <GlassCard>
          <EmptyState title={t('hosts.emptyTitle')} description={t('hosts.emptyDesc')} />
        </GlassCard>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {hosts.map((host, i) => (
            <GlassCard key={host.uuid} delay={i * 0.04} interactive style={{ opacity: host.isDisabled ? 0.55 : 1 }}>
              <Group justify="space-between" align="flex-start">
                <Group gap="sm" style={{ minWidth: 0 }}>
                  <Box
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      display: 'grid',
                      placeItems: 'center',
                      background: `${SECURITY_COLOR[host.security]}1a`,
                      border: `1px solid ${SECURITY_COLOR[host.security]}33`,
                      color: SECURITY_COLOR[host.security],
                    }}
                  >
                    <IconShieldCheckered size={20} />
                  </Box>
                  <Box style={{ minWidth: 0 }}>
                    <Text fw={650} truncate>
                      {host.remark}
                    </Text>
                    <Text fz="xs" c="dimmed" truncate>
                      {host.address}:{host.port}
                    </Text>
                  </Box>
                </Group>
                <Switch checked={!host.isDisabled} size="sm" readOnly />
              </Group>

              <Group gap={6} mt="md">
                <Badge
                  size="sm"
                  radius="sm"
                  variant="light"
                  style={{ background: `${SECURITY_COLOR[host.security]}1f`, color: SECURITY_COLOR[host.security] }}
                >
                  {host.security.toUpperCase()}
                </Badge>
                {host.sni && (
                  <Badge size="sm" radius="sm" variant="default">
                    SNI: {host.sni}
                  </Badge>
                )}
                {host.fingerprint && (
                  <Badge size="sm" radius="sm" variant="default">
                    {host.fingerprint}
                  </Badge>
                )}
              </Group>

              <Stack gap={4} mt="md">
                <Row label={t('hosts.inbound')} value={host.inboundTag ?? '—'} />
                {host.path && <Row label={t('hosts.path')} value={host.path} />}
                {host.alpn && <Row label={t('hosts.alpn')} value={host.alpn} />}
              </Stack>
            </GlassCard>
          ))}
        </SimpleGrid>
      )}
    </Page>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between">
      <Text fz="xs" c="dimmed">
        {label}
      </Text>
      <Text fz="xs" fw={500} style={{ fontFamily: 'var(--gs-font-mono)' }}>
        {value}
      </Text>
    </Group>
  );
}
