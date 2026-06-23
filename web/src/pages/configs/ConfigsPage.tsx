import {
  Badge,
  Box,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import {
  IconBraces,
  IconChevronRight,
  IconCirclePlus,
  IconCode,
  IconPuzzle2,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { EmptyState } from '@shared/ui/EmptyState';
import { useProfiles, useSnippets } from '@shared/api/hooks';
import { formatDate } from '@shared/lib/format';

const PROTOCOL_COLORS: Record<string, string> = {
  vless: '#7c5cff',
  vmess: '#22d3ee',
  trojan: '#f129b3',
  shadowsocks: '#22ff7c',
  socks: '#ffa121',
  http: '#9b9eb2',
  wireguard: '#a288f1',
};

export default function ConfigsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: profiles = [] } = useProfiles();
  const { data: snippets = [] } = useSnippets();

  return (
    <Page
      title={t('configs.title')}
      subtitle={t('configs.subtitle')}
      icon={<IconBraces size={24} />}
      actions={
        <Button
          leftSection={<IconCirclePlus size={16} />}
          variant="gradient"
          gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
          onClick={() => profiles[0] && navigate(`/configs/${profiles[0].uuid}`)}
        >
          {t('configs.newProfile')}
        </Button>
      }
    >
      <Tabs defaultValue="profiles" variant="pills" radius="md">
        <Tabs.List mb="lg">
          <Tabs.Tab value="profiles" leftSection={<IconCode size={16} />}>
            {t('configs.profiles')}
          </Tabs.Tab>
          <Tabs.Tab value="snippets" leftSection={<IconPuzzle2 size={16} />}>
            {t('configs.snippets')}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profiles">
          {profiles.length === 0 ? (
            <GlassCard>
              <EmptyState title={t('configs.title')} description={t('configs.subtitle')} />
            </GlassCard>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {profiles.map((p, i) => (
                <GlassCard
                  key={p.uuid}
                  delay={i * 0.05}
                  interactive
                  onClick={() => navigate(`/configs/${p.uuid}`)}
                >
                  <Group justify="space-between" align="flex-start">
                    <Group gap="sm">
                      <Box
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          display: 'grid',
                          placeItems: 'center',
                          background: 'rgba(124,92,255,0.14)',
                          border: '1px solid rgba(124,92,255,0.3)',
                          color: 'var(--gs-ghost)',
                        }}
                      >
                        <IconBraces size={20} />
                      </Box>
                      <Box>
                        <Text fw={680}>{p.name}</Text>
                        <Text fz="xs" c="dimmed">
                          {t('common.updated')} {formatDate(p.updatedAt, i18n.language)}
                        </Text>
                      </Box>
                    </Group>
                    <IconChevronRight size={18} color="var(--gs-text-dim)" />
                  </Group>

                  <Group gap={6} mt="md">
                    {p.inbounds.map((ib) => (
                      <Badge
                        key={ib.uuid}
                        size="sm"
                        radius="sm"
                        variant="light"
                        style={{
                          background: `${PROTOCOL_COLORS[ib.protocol] ?? '#9b9eb2'}1f`,
                          color: PROTOCOL_COLORS[ib.protocol] ?? '#9b9eb2',
                        }}
                      >
                        {ib.tag}
                      </Badge>
                    ))}
                  </Group>

                  <Group justify="space-between" mt="md">
                    <Text fz="xs" c="dimmed">
                      {p.inbounds.length} {t('configs.inboundsCount').toLowerCase()}
                    </Text>
                    <Text fz="xs" c="dimmed">
                      {p.nodesUsing} {t('configs.nodesUsing').toLowerCase()}
                    </Text>
                  </Group>
                </GlassCard>
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="snippets">
          <Stack gap="md">
            {snippets.map((s, i) => (
              <GlassCard key={s.uuid} delay={i * 0.04} p="md">
                <Group justify="space-between">
                  <Group gap="sm">
                    <IconPuzzle2 size={18} color="var(--gs-spectre)" />
                    <Title order={4} fz="md">
                      {`{{snippet:${s.name}}}`}
                    </Title>
                  </Group>
                  <Text fz="xs" c="dimmed">
                    {formatDate(s.updatedAt, i18n.language)}
                  </Text>
                </Group>
                <Box
                  mt="sm"
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid var(--gs-border)',
                    fontFamily: 'var(--gs-font-mono)',
                    fontSize: 12,
                    color: 'var(--gs-text)',
                    overflowX: 'auto',
                  }}
                >
                  {s.content}
                </Box>
              </GlassCard>
            ))}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
