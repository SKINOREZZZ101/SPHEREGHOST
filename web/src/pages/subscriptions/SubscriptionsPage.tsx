import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconBrandReact,
  IconEdit,
  IconFileText,
  IconLink,
  IconRoute,
  IconSettings,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { useSubTemplates } from '@shared/api/hooks';
import { formatDate } from '@shared/lib/format';
import type { SubscriptionFormat } from '@shared/api/types';

const FORMAT_COLOR: Record<SubscriptionFormat, string> = {
  XRAY_JSON: '#7c5cff',
  XRAY_BASE64: '#a288f1',
  CLASH: '#22d3ee',
  MIHOMO: '#22ff7c',
  SINGBOX: '#ffa121',
  STASH: '#f129b3',
};

export default function SubscriptionsPage() {
  const { t, i18n } = useTranslation();
  const { data: templates = [] } = useSubTemplates();

  return (
    <Page title={t('subscriptions.title')} subtitle={t('subscriptions.subtitle')} icon={<IconLink size={24} />}>
      <Tabs defaultValue="templates" variant="pills" radius="md">
        <Tabs.List mb="lg">
          <Tabs.Tab value="templates" leftSection={<IconFileText size={16} />}>
            {t('subscriptions.templates')}
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
            {t('subscriptions.settings')}
          </Tabs.Tab>
          <Tabs.Tab value="rules" leftSection={<IconRoute size={16} />}>
            {t('subscriptions.responseRules')}
          </Tabs.Tab>
          <Tabs.Tab value="pages" leftSection={<IconBrandReact size={16} />}>
            {t('subscriptions.pages')}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="templates">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {templates.map((tpl, i) => (
              <GlassCard key={tpl.uuid} delay={i * 0.05} interactive>
                <Group justify="space-between">
                  <Group gap="sm">
                    <Box
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        display: 'grid',
                        placeItems: 'center',
                        background: `${FORMAT_COLOR[tpl.type]}1a`,
                        border: `1px solid ${FORMAT_COLOR[tpl.type]}33`,
                        color: FORMAT_COLOR[tpl.type],
                      }}
                    >
                      <IconFileText size={20} />
                    </Box>
                    <Box>
                      <Text fw={680}>{tpl.name}</Text>
                      <Text fz="xs" c="dimmed">
                        {formatDate(tpl.updatedAt, i18n.language)}
                      </Text>
                    </Box>
                  </Group>
                  <IconEdit size={18} color="var(--gs-text-dim)" />
                </Group>
                <Badge
                  mt="md"
                  variant="light"
                  radius="sm"
                  style={{ background: `${FORMAT_COLOR[tpl.type]}1f`, color: FORMAT_COLOR[tpl.type] }}
                >
                  {tpl.type}
                </Badge>
              </GlassCard>
            ))}
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <SubscriptionSettings />
        </Tabs.Panel>

        <Tabs.Panel value="rules">
          <GlassCard>
            <Title order={4} fz="md" mb="xs">
              {t('subscriptions.responseRules')}
            </Title>
            <Text c="dimmed" fz="sm">
              {t('common.comingSoonDesc')}
            </Text>
          </GlassCard>
        </Tabs.Panel>

        <Tabs.Panel value="pages">
          <GlassCard>
            <Title order={4} fz="md" mb="xs">
              {t('subscriptions.pages')}
            </Title>
            <Text c="dimmed" fz="sm">
              {t('common.comingSoonDesc')}
            </Text>
          </GlassCard>
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}

function SubscriptionSettings() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('Ghost Sphere VPN');
  const [interval, setInterval] = useState<number | string>(12);
  const [support, setSupport] = useState('https://t.me/ghost_support');
  const [randomize, setRandomize] = useState(true);

  return (
    <GlassCard maw={620}>
      <Stack gap="md">
        <TextInput label={t('subscriptions.profileTitle')} value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
        <NumberInput label={t('subscriptions.updateInterval')} value={interval} onChange={setInterval} min={1} max={168} />
        <TextInput label={t('subscriptions.supportLink')} value={support} onChange={(e) => setSupport(e.currentTarget.value)} />
        <Switch
          label={t('subscriptions.randomizeHosts')}
          checked={randomize}
          onChange={(e) => setRandomize(e.currentTarget.checked)}
        />
        <Group justify="flex-end">
          <Button variant="gradient" gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}>
            {t('common.save')}
          </Button>
        </Group>
      </Stack>
    </GlassCard>
  );
}
