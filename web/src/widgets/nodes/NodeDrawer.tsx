import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Drawer,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  TagsInput,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconActivity,
  IconBrandDocker,
  IconCheck,
  IconCpu,
  IconDeviceDesktop,
  IconDownload,
  IconPlayerPlay,
  IconPlayerStop,
  IconReload,
  IconRefresh,
  IconServerBolt,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { StatusDot } from '@shared/ui/StatusDot';
import { Meter } from '@shared/ui/Meter';
import { useNode, useNodeAction, useProfiles, useUpdateNode } from '@shared/api/hooks';
import { clampPercent, copyToClipboard, countryFlag, formatBytes, formatUptime } from '@shared/lib/format';
import { nodeDockerCompose, nodeInstallCommand } from '@shared/lib/node-compose';
import { SphereApi } from '@shared/api/sphere';
import type { GsNode } from '@shared/api/types';

const COUNTRY_OPTIONS = [
  'RU', 'DE', 'NL', 'FI', 'PL', 'FR', 'GB', 'US', 'JP', 'SG', 'TR', 'AE', 'HK', 'SE', 'CH', 'CA', 'XX',
].map((c) => ({ value: c, label: `${countryFlag(c)} ${c}` }));

const GIB = 1024 ** 3;

interface NodeDrawerProps {
  node: GsNode | null;
  opened: boolean;
  onClose: () => void;
}

export function NodeDrawer({ node, opened, onClose }: NodeDrawerProps) {
  const { data: live } = useNode(opened ? node?.uuid ?? null : null);
  const n = live ?? node;

  if (!node) return null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={560}
      withCloseButton={false}
      padding={0}
      overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
      styles={{ content: { background: 'var(--gs-surface, #0d1016)' } }}
    >
      {n && <DrawerBody n={n} onClose={onClose} />}
    </Drawer>
  );
}

function DrawerBody({ n, onClose }: { n: GsNode; onClose: () => void }) {
  const { t } = useTranslation();
  const action = useNodeAction();
  const trafficPct = n.trafficLimitBytes ? clampPercent(n.trafficUsedBytes, n.trafficLimitBytes) : 0;

  const runAction = (a: Parameters<typeof action.mutate>[0]['action'], label: string, close = false) => {
    action.mutate(
      { uuid: n.uuid, action: a },
      {
        onSuccess: () => {
          notifications.show({ message: label, color: 'teal' });
          if (close) onClose();
        },
        onError: () => notifications.show({ message: t('errors.generic'), color: 'red' }),
      },
    );
  };

  return (
    <Stack gap={0} h="100%">
      {/* Header */}
      <Box
        p="lg"
        style={{
          borderBottom: '1px solid var(--gs-border)',
          background: 'linear-gradient(180deg, rgba(124,92,255,0.08), transparent)',
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <Box style={{ fontSize: 34, lineHeight: 1 }}>{countryFlag(n.countryCode)}</Box>
            <Box style={{ minWidth: 0 }}>
              <Text fw={760} fz="xl" truncate style={{ fontFamily: 'var(--gs-font-display)' }}>
                {n.name}
              </Text>
              <Text fz="sm" c="dimmed" truncate>
                {n.address}:{n.port}
              </Text>
            </Box>
          </Group>
          <ActionIcon variant="subtle" color="gray" size="lg" onClick={onClose}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>×</span>
          </ActionIcon>
        </Group>

        <Group justify="space-between" mt="md">
          <StatusDot
            status={n.status}
            pulse={n.isConnected}
            label={
              n.status === 'connected'
                ? t('nodes.connected')
                : n.status === 'connecting'
                  ? t('nodes.connecting')
                  : n.status === 'disabled'
                    ? t('common.disabled')
                    : t('nodes.disconnected')
            }
          />
          <Group gap={6}>
            {n.xrayVersion && (
              <Badge size="sm" variant="default" radius="sm">
                Xray {n.xrayVersion}
              </Badge>
            )}
            {n.nodeVersion && (
              <Badge size="sm" variant="default" radius="sm">
                Node {n.nodeVersion}
              </Badge>
            )}
          </Group>
        </Group>

        {n.lastStatusMessage && (
          <Text fz="xs" c="dimmed" mt={8} lineClamp={2}>
            {n.lastStatusMessage}
          </Text>
        )}
      </Box>

      <Box style={{ flex: 1, overflowY: 'auto' }} p="lg">
        <Tabs defaultValue="overview" variant="pills" color="ghost" radius="md">
          <Tabs.List mb="lg">
            <Tabs.Tab value="overview" leftSection={<IconActivity size={15} />}>
              {t('nodes.tabOverview')}
            </Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconSettings size={15} />}>
              {t('nodes.tabSettings')}
            </Tabs.Tab>
            <Tabs.Tab value="install" leftSection={<IconBrandDocker size={15} />}>
              {t('nodes.tabInstall')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Stack gap="lg">
              <SimpleGrid cols={2} spacing="md">
                <StatBox label={t('nodes.usersOnline')} value={n.usersOnline.toLocaleString()} icon={<IconDeviceDesktop size={16} />} color="#22ff7c" />
                <StatBox label={t('nodes.uptime')} value={n.isConnected ? formatUptime(n.xrayUptimeSeconds) : '—'} icon={<IconServerBolt size={16} />} color="#7c5cff" />
                <StatBox label="CPU" value={`${n.cpuPercent}%`} icon={<IconCpu size={16} />} color="#22d3ee" />
                <StatBox label="RAM" value={`${n.ramPercent}%`} icon={<IconCpu size={16} />} color="#a288f1" />
              </SimpleGrid>

              <Box>
                <Meter value={n.cpuPercent} label={`CPU · ${n.cpuPercent}%`} color="#22d3ee" height={6} />
                <Box mt="sm">
                  <Meter value={n.ramPercent} label={`RAM · ${n.ramPercent}%`} color="#a288f1" height={6} />
                </Box>
                <Box mt="sm">
                  <Meter
                    value={n.trafficLimitBytes ? trafficPct : 0}
                    label={t('nodes.trafficUsed')}
                    right={
                      n.trafficLimitBytes
                        ? `${formatBytes(n.trafficUsedBytes)} / ${formatBytes(n.trafficLimitBytes)}`
                        : formatBytes(n.trafficUsedBytes)
                    }
                    color="#22ff7c"
                    height={6}
                  />
                </Box>
              </Box>

              <Box className="gs-glass" style={{ borderRadius: 12, padding: 14 }}>
                <Text fz="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }} mb={6}>
                  {t('nodes.profile')}
                </Text>
                <Text fw={620}>{n.activeConfigProfileName ?? '—'}</Text>
                <Group gap={6} mt={8}>
                  {n.activeInbounds.length > 0 ? (
                    n.activeInbounds.map((tag) => (
                      <Badge key={tag} size="sm" variant="default" radius="sm">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <Text fz="xs" c="dimmed">
                      {t('common.empty')}
                    </Text>
                  )}
                </Group>
              </Box>

              {/* Actions */}
              <Stack gap="xs">
                <Text fz="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                  {t('nodes.actions')}
                </Text>
                <SimpleGrid cols={2} spacing="xs">
                  <Button
                    variant="light"
                    color="ghost"
                    leftSection={<IconReload size={16} />}
                    loading={action.isPending}
                    onClick={() => runAction('restart', t('nodes.reconnecting'))}
                  >
                    {t('nodes.reconnect')}
                  </Button>
                  {n.isDisabled ? (
                    <Button
                      variant="light"
                      color="teal"
                      leftSection={<IconPlayerPlay size={16} />}
                      onClick={() => runAction('enable', t('nodes.updated'))}
                    >
                      {t('nodes.enable')}
                    </Button>
                  ) : (
                    <Button
                      variant="light"
                      color="yellow"
                      leftSection={<IconPlayerStop size={16} />}
                      onClick={() => runAction('disable', t('nodes.updated'))}
                    >
                      {t('nodes.disable')}
                    </Button>
                  )}
                  <Button
                    variant="light"
                    color="gray"
                    leftSection={<IconRefresh size={16} />}
                    onClick={() => runAction('reset-traffic', t('nodes.updated'))}
                  >
                    {t('nodes.resetTraffic')}
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() =>
                      modals.openConfirmModal({
                        title: t('nodes.confirmDelete', { name: n.name }),
                        labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
                        confirmProps: { color: 'red' },
                        onConfirm: () => runAction('delete', t('nodes.deleted'), true),
                      })
                    }
                  >
                    {t('common.delete')}
                  </Button>
                </SimpleGrid>
              </Stack>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="settings">
            <SettingsForm n={n} />
          </Tabs.Panel>

          <Tabs.Panel value="install">
            <InstallPanel n={n} />
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Stack>
  );
}

function StatBox({ label, value, icon, color }: { label: string; value: string; icon: ReactNode; color: string }) {
  return (
    <Box className="gs-glass" style={{ borderRadius: 12, padding: '12px 14px' }}>
      <Group gap={8} mb={4}>
        <ThemeIcon size={24} radius="md" variant="light" style={{ color, background: `${color}1a` }}>
          {icon}
        </ThemeIcon>
        <Text fz="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
          {label}
        </Text>
      </Group>
      <Text fz={22} fw={720} style={{ fontFamily: 'var(--gs-font-display)' }}>
        {value}
      </Text>
    </Box>
  );
}

function SettingsForm({ n }: { n: GsNode }) {
  const { t } = useTranslation();
  const update = useUpdateNode();
  const { data: profiles = [] } = useProfiles();

  const [name, setName] = useState(n.name);
  const [address, setAddress] = useState(n.address);
  const [port, setPort] = useState<number | string>(n.port);
  const [country, setCountry] = useState(n.countryCode || 'XX');
  const [profile, setProfile] = useState<string | null>(n.activeConfigProfileUuid);
  const [multiplier, setMultiplier] = useState<number | string>(n.consumptionMultiplier);
  const [limitGb, setLimitGb] = useState<number | string>(n.trafficLimitBytes ? +(n.trafficLimitBytes / GIB).toFixed(2) : 0);
  const [tracking, setTracking] = useState<boolean>(!!n.trafficLimitBytes);
  const [tags, setTags] = useState<string[]>(n.tags ?? []);

  // Re-sync when a different node is opened.
  useEffect(() => {
    setName(n.name);
    setAddress(n.address);
    setPort(n.port);
    setCountry(n.countryCode || 'XX');
    setProfile(n.activeConfigProfileUuid);
    setMultiplier(n.consumptionMultiplier);
    setLimitGb(n.trafficLimitBytes ? +(n.trafficLimitBytes / GIB).toFixed(2) : 0);
    setTracking(!!n.trafficLimitBytes);
    setTags(n.tags ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n.uuid]);

  const selectedProfile = profiles.find((p) => p.uuid === profile);
  const inbounds = selectedProfile?.inbounds ?? [];
  const valid = name.trim().length >= 3 && address.trim().length >= 2 && !!profile;

  const save = () => {
    update.mutate(
      {
        uuid: n.uuid,
        name: name.trim(),
        address: address.trim(),
        port: Number(port) || 2222,
        countryCode: country,
        consumptionMultiplier: Number(multiplier) || 1,
        trafficLimitBytes: Math.round((Number(limitGb) || 0) * GIB),
        isTrafficTrackingActive: tracking,
        activeConfigProfileUuid: profile,
        activeInbounds: inbounds.map((i) => i.uuid),
        tags,
      },
      {
        onSuccess: () => notifications.show({ message: t('nodes.updated'), color: 'teal' }),
        onError: (e: unknown) => {
          const data = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data;
          const m = Array.isArray(data?.message) ? data?.message.join('; ') : data?.message;
          notifications.show({ message: m || t('errors.generic'), color: 'red' });
        },
      },
    );
  };

  return (
    <Stack gap="md">
      <TextInput label={t('common.name')} value={name} onChange={(e) => setName(e.currentTarget.value)} withAsterisk />
      <Group grow>
        <TextInput label={t('nodes.address')} value={address} onChange={(e) => setAddress(e.currentTarget.value)} withAsterisk />
        <NumberInput label={t('nodes.port')} value={port} onChange={setPort} min={1} max={65535} withAsterisk />
      </Group>
      <Group grow>
        <Select label={t('nodes.country')} data={COUNTRY_OPTIONS} value={country} onChange={(v) => setCountry(v ?? 'XX')} searchable allowDeselect={false} />
        <Select
          label={t('nodes.profile')}
          data={profiles.map((p) => ({ value: p.uuid, label: p.name }))}
          value={profile}
          onChange={setProfile}
          placeholder={t('nodes.selectProfile')}
          allowDeselect={false}
        />
      </Group>

      {selectedProfile && (
        <Box className="gs-glass" style={{ borderRadius: 12, padding: 12 }}>
          <Text fz="xs" c="dimmed" mb={6}>
            {t('nodes.inbounds')}: {inbounds.length}
          </Text>
          <Group gap={6}>
            {inbounds.map((ib) => (
              <Badge key={ib.uuid} size="sm" variant="default" radius="sm">
                {ib.tag}
              </Badge>
            ))}
            {inbounds.length === 0 && <Text fz="xs" c="dimmed">{t('common.empty')}</Text>}
          </Group>
        </Box>
      )}

      <Group grow>
        <NumberInput
          label={t('nodes.consumptionMultiplier')}
          value={multiplier}
          onChange={setMultiplier}
          min={0.1}
          max={100}
          step={0.1}
          decimalScale={1}
        />
        <NumberInput
          label={t('nodes.trafficLimitGb')}
          value={limitGb}
          onChange={setLimitGb}
          min={0}
          step={10}
          description={Number(limitGb) > 0 ? formatBytes(Number(limitGb) * GIB) : t('nodes.unlimited')}
        />
      </Group>

      <Switch
        label={t('nodes.trafficTracking')}
        checked={tracking}
        onChange={(e) => setTracking(e.currentTarget.checked)}
        color="ghost"
      />

      <TagsInput label={t('nodes.tags')} value={tags} onChange={setTags} placeholder="PREMIUM" maxTags={10} clearable />

      <Button
        mt="sm"
        onClick={save}
        loading={update.isPending}
        disabled={!valid}
        leftSection={<IconCheck size={16} />}
        variant="gradient"
        gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
      >
        {t('common.save')}
      </Button>
    </Stack>
  );
}

function InstallPanel({ n }: { n: GsNode }) {
  const { t } = useTranslation();
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const regen = () => {
    setLoading(true);
    SphereApi.keygen()
      .then((k) => setSecret(k.secretKey || ''))
      .catch(() => notifications.show({ message: t('errors.generic'), color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    regen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const compose = useMemo(() => nodeDockerCompose(secret, n.port), [secret, n.port]);
  const installCmd = useMemo(() => nodeInstallCommand(secret), [secret]);

  const copy = async (value: string, label: string) => {
    const ok = await copyToClipboard(value);
    notifications.show({ message: ok ? label : t('nodes.copyManual'), color: ok ? 'teal' : 'red' });
  };

  return (
    <Stack gap="md">
      <Text fz="sm" c="dimmed">
        {t('nodes.reinstallDesc')}
      </Text>

      <CodeField label="SECRET_KEY" value={secret || '…'} onCopy={() => copy(secret, t('common.copied'))} />
      <CodeField label={t('nodes.copyCommand')} value={installCmd} onCopy={() => copy(installCmd, t('common.copied'))} />
      <CodeField
        label="docker-compose.yml"
        value={compose}
        multiline
        onCopy={() => copy(compose, 'docker-compose.yml ' + t('common.copied'))}
      />

      <Button variant="default" leftSection={<IconRefresh size={16} />} loading={loading} onClick={regen}>
        {t('nodes.regenKey')}
      </Button>
    </Stack>
  );
}

function CodeField({
  label,
  value,
  multiline,
  onCopy,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  onCopy: () => void;
}) {
  return (
    <Box>
      <Group justify="space-between" mb={6}>
        <Text fz="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
          {label}
        </Text>
        <Tooltip label={label}>
          <ActionIcon size="sm" variant="subtle" onClick={onCopy}>
            <IconDownload size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Box
        onClick={onCopy}
        style={{
          padding: '12px 14px',
          borderRadius: 12,
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid var(--gs-border)',
          fontFamily: 'var(--gs-font-mono)',
          fontSize: 12,
          color: 'var(--gs-spectre)',
          whiteSpace: multiline ? 'pre' : 'nowrap',
          overflow: 'auto',
          maxHeight: multiline ? 200 : undefined,
          textOverflow: multiline ? undefined : 'ellipsis',
          cursor: 'pointer',
        }}
      >
        {value}
      </Box>
    </Box>
  );
}
