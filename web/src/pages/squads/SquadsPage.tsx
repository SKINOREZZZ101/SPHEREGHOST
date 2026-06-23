import { Badge, Box, Button, Group, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { IconCirclePlus, IconUsersGroup } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { EmptyState } from '@shared/ui/EmptyState';
import { useSquads } from '@shared/api/hooks';
import type { GsSquad } from '@shared/api/types';

export default function SquadsPage() {
  const { t } = useTranslation();
  const { data: squads = [] } = useSquads();
  const internal = squads.filter((s) => s.kind === 'internal');
  const external = squads.filter((s) => s.kind === 'external');

  return (
    <Page
      title={t('squads.title')}
      subtitle={t('squads.subtitle')}
      icon={<IconUsersGroup size={24} />}
      actions={
        <Button
          leftSection={<IconCirclePlus size={16} />}
          variant="gradient"
          gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
        >
          {t('squads.addSquad')}
        </Button>
      }
    >
      <Tabs defaultValue="internal" variant="pills" radius="md">
        <Tabs.List mb="lg">
          <Tabs.Tab value="internal">{t('squads.internal')}</Tabs.Tab>
          <Tabs.Tab value="external">{t('squads.external')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="internal">
          <SquadGrid squads={internal} emptyTitle={t('squads.emptyTitle')} emptyDesc={t('squads.emptyDesc')} />
        </Tabs.Panel>
        <Tabs.Panel value="external">
          <SquadGrid squads={external} emptyTitle={t('squads.emptyTitle')} emptyDesc={t('squads.emptyDesc')} />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}

function SquadGrid({ squads, emptyTitle, emptyDesc }: { squads: GsSquad[]; emptyTitle: string; emptyDesc: string }) {
  const { t } = useTranslation();
  if (squads.length === 0) {
    return (
      <GlassCard>
        <EmptyState title={emptyTitle} description={emptyDesc} />
      </GlassCard>
    );
  }
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {squads.map((sq, i) => (
        <GlassCard key={sq.uuid} delay={i * 0.04} interactive>
          <Group justify="space-between">
            <Group gap="sm">
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, rgba(241,41,179,0.2), rgba(124,92,255,0.12))',
                  border: '1px solid var(--gs-border)',
                  color: '#f129b3',
                }}
              >
                <IconUsersGroup size={22} />
              </Box>
              <Box>
                <Text fw={680}>{sq.name}</Text>
                <Text fz="xs" c="dimmed">
                  {sq.membersCount} {t('squads.members').toLowerCase()}
                </Text>
              </Box>
            </Group>
            <Badge variant="light" color="plasma" radius="sm">
              {sq.kind}
            </Badge>
          </Group>
          <Stack gap={6} mt="md">
            <Text fz="xs" c="dimmed">
              {t('squads.inbounds')}
            </Text>
            <Group gap={6}>
              {sq.inbounds.map((ib) => (
                <Badge key={ib} size="sm" radius="sm" variant="default">
                  {ib}
                </Badge>
              ))}
            </Group>
          </Stack>
        </GlassCard>
      ))}
    </SimpleGrid>
  );
}
