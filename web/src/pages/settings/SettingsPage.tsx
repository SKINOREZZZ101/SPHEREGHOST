import {
  Badge,
  Box,
  Button,
  Group,
  SegmentedControl,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Tabs,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconBrandGithub,
  IconCheck,
  IconInfoCircle,
  IconPalette,
  IconServerBolt,
  IconSettings,
  IconTrash,
  IconWorld,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { Logo } from '@shared/ui/Logo';
import { StatusDot } from '@shared/ui/StatusDot';
import { useSettings, type AccentColor } from '@entities/settings/settings.store';
import { useSession } from '@entities/session/session.store';
import i18n, { SUPPORTED_LANGUAGES } from '@shared/i18n/i18n';
import { APP } from '@shared/config';

const ACCENTS: { value: AccentColor; color: string }[] = [
  { value: 'ghost', color: '#C8CDD8' },
  { value: 'spectre', color: '#94A3B8' },
  { value: 'plasma', color: '#a78bfa' },
  { value: 'toxic', color: '#2EE5A3' },
  { value: 'ember', color: '#fbbf24' },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const settings = useSettings();
  const connection = useSession((s) => s.connection);
  const mode = useSession((s) => s.mode);
  const logout = useSession((s) => s.logout);

  const resetApp = () =>
    modals.openConfirmModal({
      title: t('settings.resetApp'),
      children: <Text fz="sm">{t('settings.resetAppDesc')}</Text>,
      labels: { confirm: t('settings.resetApp'), cancel: t('common.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        localStorage.clear();
        logout();
        window.location.reload();
      },
    });

  return (
    <Page title={t('settings.title')} subtitle={t('settings.subtitle')} icon={<IconSettings size={24} />}>
      <Tabs defaultValue="appearance" variant="pills" radius="md">
        <Tabs.List mb="lg">
          <Tabs.Tab value="appearance" leftSection={<IconPalette size={16} />}>
            {t('settings.appearance')}
          </Tabs.Tab>
          <Tabs.Tab value="panels" leftSection={<IconServerBolt size={16} />}>
            {t('settings.panels')}
          </Tabs.Tab>
          <Tabs.Tab value="general" leftSection={<IconWorld size={16} />}>
            {t('settings.general')}
          </Tabs.Tab>
          <Tabs.Tab value="about" leftSection={<IconInfoCircle size={16} />}>
            {t('settings.about')}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="appearance">
          <Stack gap="md" maw={680}>
            <GlassCard>
              <Title order={4} fz="md" mb="md">
                {t('settings.accent')}
              </Title>
              <Group gap="sm">
                {ACCENTS.map((a) => (
                  <Tooltip key={a.value} label={a.value}>
                    <UnstyledButton onClick={() => settings.set('accent', a.value)}>
                      <Box
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: a.color,
                          boxShadow: `0 0 16px ${a.color}88`,
                          display: 'grid',
                          placeItems: 'center',
                          border: settings.accent === a.value ? '2px solid #fff' : '2px solid transparent',
                        }}
                      >
                        {settings.accent === a.value && <IconCheck size={20} color="#fff" />}
                      </Box>
                    </UnstyledButton>
                  </Tooltip>
                ))}
              </Group>
            </GlassCard>

            <GlassCard>
              <Stack gap="lg">
                <Box>
                  <Text fw={600} mb="xs">
                    {t('settings.density')}
                  </Text>
                  <SegmentedControl
                    value={settings.density}
                    onChange={(v) => settings.set('density', v as 'comfortable' | 'compact')}
                    data={[
                      { value: 'comfortable', label: t('settings.densityComfortable') },
                      { value: 'compact', label: t('settings.densityCompact') },
                    ]}
                  />
                </Box>
                <ToggleRow
                  label={t('settings.animations')}
                  desc={t('settings.animationsDesc')}
                  checked={settings.animations}
                  onChange={(v) => settings.set('animations', v)}
                />
                <ToggleRow
                  label={t('settings.glow')}
                  checked={settings.glow}
                  onChange={(v) => settings.set('glow', v)}
                />
                <ToggleRow
                  label={t('settings.grain')}
                  checked={settings.grain}
                  onChange={(v) => settings.set('grain', v)}
                />
              </Stack>
            </GlassCard>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="panels">
          <Stack gap="md" maw={680}>
            <GlassCard glow="ghost">
              <Group justify="space-between" mb="md">
                <Title order={4} fz="md">
                  {t('settings.activePanel')}
                </Title>
                <Badge color={mode === 'demo' ? 'ember' : 'toxic'} variant="light">
                  {mode === 'demo' ? t('common.demoMode') : t('common.online')}
                </Badge>
              </Group>
              <Stack gap="xs">
                <Row label={t('settings.panelName')} value={connection?.name ?? '—'} />
                <Row label={t('auth.panelUrl')} value={connection?.url ?? '—'} />
                <Group gap="sm" mt="xs">
                  <StatusDot status="operational" pulse />
                  <Text fz="sm" c="dimmed">
                    {t('status.healthy')}
                  </Text>
                </Group>
              </Stack>
            </GlassCard>
            <Button variant="default" leftSection={<IconServerBolt size={16} />} onClick={logout}>
              {t('settings.addPanel')}
            </Button>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="general">
          <Stack gap="md" maw={680}>
            <GlassCard>
              <Text fw={600} mb="xs">
                {t('settings.language')}
              </Text>
              <SegmentedControl
                value={i18n.language.startsWith('ru') ? 'ru' : 'en'}
                onChange={(v) => void i18n.changeLanguage(v)}
                data={SUPPORTED_LANGUAGES.map((l) => ({ value: l.code, label: `${l.flag} ${l.label}` }))}
              />
            </GlassCard>
            <GlassCard>
              <Text fw={600} mb="md">
                {t('settings.pollInterval')}: {settings.pollIntervalSec}s
              </Text>
              <Slider
                value={settings.pollIntervalSec}
                onChange={(v) => settings.set('pollIntervalSec', v)}
                min={3}
                max={60}
                step={1}
                marks={[
                  { value: 5, label: '5s' },
                  { value: 30, label: '30s' },
                  { value: 60, label: '60s' },
                ]}
              />
            </GlassCard>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="about">
          <Stack gap="md" maw={680}>
            <GlassCard glow="ghost">
              <Group justify="space-between" align="flex-start">
                <Logo size={44} />
                <Badge variant="light" color="ghost" size="lg">
                  v{APP.version}
                </Badge>
              </Group>
              <Text c="dimmed" fz="sm" mt="md">
                {t('settings.aboutText')}
              </Text>
              <SimpleGrid cols={2} mt="lg" spacing="sm">
                <Row label={t('common.version')} value={APP.version} />
                <Row label="Vendor" value={APP.vendor} />
              </SimpleGrid>
              <Group mt="lg" gap="sm">
                <Button
                  variant="default"
                  leftSection={<IconBrandGithub size={16} />}
                  component="a"
                  href={APP.repo}
                  target="_blank"
                >
                  GitHub
                </Button>
              </Group>
            </GlassCard>

            <GlassCard style={{ borderColor: 'rgba(255,77,109,0.3)' }}>
              <Title order={4} fz="md" c="red.4" mb="xs">
                {t('settings.dangerZone')}
              </Title>
              <Text c="dimmed" fz="sm" mb="md">
                {t('settings.resetAppDesc')}
              </Text>
              <Button color="red" variant="light" leftSection={<IconTrash size={16} />} onClick={resetApp}>
                {t('settings.resetApp')}
              </Button>
            </GlassCard>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Group justify="space-between" wrap="nowrap" align="flex-start">
      <Box>
        <Text fw={500}>{label}</Text>
        {desc && (
          <Text fz="xs" c="dimmed" maw={420}>
            {desc}
          </Text>
        )}
      </Box>
      <Switch checked={checked} onChange={(e) => onChange(e.currentTarget.checked)} />
    </Group>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text fz="sm" c="dimmed">
        {label}
      </Text>
      <Text fz="sm" fw={500} truncate maw={360}>
        {value}
      </Text>
    </Group>
  );
}
