import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconCirclePlus,
  IconDotsVertical,
  IconDownload,
  IconLayoutGrid,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconReload,
  IconServer2,
  IconTable,
  IconTerminal2,
  IconTrash,
} from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { EmptyState } from '@shared/ui/EmptyState';
import { StatusDot } from '@shared/ui/StatusDot';
import { Meter } from '@shared/ui/Meter';
import { useCreateNode, useNodeAction, useNodes, useProfiles } from '@shared/api/hooks';
import { clampPercent, copyToClipboard, countryFlag, formatBytes, formatUptime } from '@shared/lib/format';
import type { GsNode } from '@shared/api/types';
import { SphereApi } from '@shared/api/sphere';

export default function NodesPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const { data: nodes = [], isLoading } = useNodes();
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [createOpen, createCtl] = useDisclosure(false);
  const [installOpen, installCtl] = useDisclosure(false);

  useEffect(() => {
    if (params.get('create') === '1') {
      createCtl.open();
      params.delete('create');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalOnline = useMemo(() => nodes.reduce((a, n) => a + n.usersOnline, 0), [nodes]);
  const totalTraffic = useMemo(() => nodes.reduce((a, n) => a + n.trafficUsedBytes, 0), [nodes]);

  return (
    <Page
      title={t('nodes.title')}
      subtitle={t('nodes.subtitle')}
      icon={<IconServer2 size={24} />}
      actions={
        <Group gap="xs">
          <SegmentedControl
            value={view}
            onChange={(v) => setView(v as 'cards' | 'table')}
            data={[
              { value: 'cards', label: <IconLayoutGrid size={16} /> },
              { value: 'table', label: <IconTable size={16} /> },
            ]}
            size="sm"
          />
          <Button variant="default" leftSection={<IconTerminal2 size={16} />} onClick={installCtl.open}>
            {t('nodes.install')}
          </Button>
          <Button
            leftSection={<IconCirclePlus size={16} />}
            onClick={createCtl.open}
            variant="gradient"
            gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
          >
            {t('nodes.add')}
          </Button>
        </Group>
      }
    >
      <Stack gap="lg">
        {nodes.length > 0 && (
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <MiniStat label={t('nodes.usersOnline')} value={totalOnline.toLocaleString()} color="#22ff7c" />
            <MiniStat label={t('nodes.trafficUsed')} value={formatBytes(totalTraffic)} color="#22d3ee" />
            <MiniStat
              label={t('common.online')}
              value={`${nodes.filter((n) => n.isConnected).length}/${nodes.length}`}
              color="#7c5cff"
            />
            <MiniStat
              label={t('nodes.realtimeUsage')}
              value={`${Math.round(nodes.reduce((a, n) => a + n.cpuPercent, 0) / Math.max(1, nodes.length))}%`}
              color="#ffa121"
            />
          </SimpleGrid>
        )}

        {isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {Array.from({ length: 6 }).map((_, i) => (
              <Box key={i} className="gs-glass gs-shimmer" style={{ height: 200, borderRadius: 18 }} />
            ))}
          </SimpleGrid>
        ) : nodes.length === 0 ? (
          <GlassCard>
            <EmptyState
              title={t('nodes.emptyTitle')}
              description={t('nodes.emptyDesc')}
              action={{ label: t('nodes.addFirst'), onClick: createCtl.open, icon: <IconCirclePlus size={16} /> }}
            />
          </GlassCard>
        ) : view === 'cards' ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {nodes.map((node, i) => (
              <NodeCard key={node.uuid} node={node} delay={i * 0.04} />
            ))}
          </SimpleGrid>
        ) : (
          <NodesTable nodes={nodes} />
        )}
      </Stack>

      <CreateNodeModal opened={createOpen} onClose={createCtl.close} />
      <InstallWizard opened={installOpen} onClose={installCtl.close} />
    </Page>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <GlassCard p="md">
      <Text fz="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
        {label}
      </Text>
      <Text fz={22} fw={720} mt={4} style={{ color, fontFamily: 'var(--gs-font-display)' }}>
        {value}
      </Text>
    </GlassCard>
  );
}

function NodeActions({ node }: { node: GsNode }) {
  const { t } = useTranslation();
  const action = useNodeAction();

  const run = (a: Parameters<typeof action.mutate>[0]['action'], label: string) => {
    action.mutate(
      { uuid: node.uuid, action: a },
      { onSuccess: () => notifications.show({ message: label, color: 'teal' }) },
    );
  };

  return (
    <Menu shadow="lg" width={196} position="bottom-end" radius="md">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray">
          <IconDotsVertical size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {node.isDisabled ? (
          <Menu.Item leftSection={<IconPlayerPlay size={16} />} onClick={() => run('enable', t('nodes.updated'))}>
            {t('nodes.enable')}
          </Menu.Item>
        ) : (
          <Menu.Item leftSection={<IconPlayerStop size={16} />} onClick={() => run('disable', t('nodes.updated'))}>
            {t('nodes.disable')}
          </Menu.Item>
        )}
        <Menu.Item leftSection={<IconReload size={16} />} onClick={() => run('restart', t('nodes.updated'))}>
          {t('nodes.restart')}
        </Menu.Item>
        <Menu.Item leftSection={<IconRefresh size={16} />} onClick={() => run('reset-traffic', t('nodes.updated'))}>
          {t('nodes.resetTraffic')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconTrash size={16} />}
          onClick={() =>
            modals.openConfirmModal({
              title: t('nodes.confirmDelete', { name: node.name }),
              labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
              confirmProps: { color: 'red' },
              onConfirm: () => run('delete', t('nodes.deleted')),
            })
          }
        >
          {t('common.delete')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function NodeCard({ node, delay }: { node: GsNode; delay: number }) {
  const { t } = useTranslation();
  const trafficPct = node.trafficLimitBytes
    ? clampPercent(node.trafficUsedBytes, node.trafficLimitBytes)
    : 0;

  return (
    <GlassCard delay={delay} interactive glow={node.isConnected ? 'none' : 'none'}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <Box style={{ fontSize: 30, lineHeight: 1 }}>{countryFlag(node.countryCode)}</Box>
          <Box style={{ minWidth: 0 }}>
            <Text fw={680} truncate>
              {node.name}
            </Text>
            <Text fz="xs" c="dimmed" truncate>
              {node.address}:{node.port}
            </Text>
          </Box>
        </Group>
        <NodeActions node={node} />
      </Group>

      <Group justify="space-between" mt="md" mb="xs">
        <StatusDot
          status={node.status}
          pulse={node.isConnected}
          label={
            node.status === 'connected'
              ? t('nodes.connected')
              : node.status === 'connecting'
                ? t('nodes.connecting')
                : node.status === 'disabled'
                  ? t('common.disabled')
                  : t('nodes.disconnected')
          }
        />
        {node.xrayVersion && (
          <Badge size="sm" variant="default" radius="sm">
            Xray {node.xrayVersion}
          </Badge>
        )}
      </Group>

      <Stack gap={10} mt="sm">
        <Group justify="space-between">
          <Text fz="xs" c="dimmed">
            {t('nodes.usersOnline')}
          </Text>
          <Text fz="sm" fw={650}>
            {node.usersOnline.toLocaleString()}
          </Text>
        </Group>
        <Meter
          value={node.cpuPercent}
          label={`CPU · ${node.cpuPercent}%`}
          color="#22d3ee"
          height={5}
        />
        <Meter value={node.ramPercent} label={`RAM · ${node.ramPercent}%`} color="#a288f1" height={5} />
        <Meter
          value={node.trafficLimitBytes ? trafficPct : 0}
          label={t('nodes.trafficUsed')}
          right={
            node.trafficLimitBytes
              ? `${formatBytes(node.trafficUsedBytes)} / ${formatBytes(node.trafficLimitBytes)}`
              : formatBytes(node.trafficUsedBytes)
          }
          color="#22ff7c"
          height={5}
        />
      </Stack>

      <Group justify="space-between" mt="md" gap="xs">
        <Text fz="xs" c="dimmed">
          {node.activeConfigProfileName ?? '—'}
        </Text>
        {node.isConnected && (
          <Text fz="xs" c="dimmed">
            ↑ {formatUptime(node.xrayUptimeSeconds)}
          </Text>
        )}
      </Group>
    </GlassCard>
  );
}

function NodesTable({ nodes }: { nodes: GsNode[] }) {
  const { t } = useTranslation();
  return (
    <GlassCard p={0} style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={760}>
        <Table verticalSpacing="sm" horizontalSpacing="lg" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('common.name')}</Table.Th>
              <Table.Th>{t('common.status')}</Table.Th>
              <Table.Th>{t('nodes.usersOnline')}</Table.Th>
              <Table.Th>CPU / RAM</Table.Th>
              <Table.Th>{t('nodes.trafficUsed')}</Table.Th>
              <Table.Th>Xray</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {nodes.map((n) => (
              <Table.Tr key={n.uuid}>
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <span style={{ fontSize: 20 }}>{countryFlag(n.countryCode)}</span>
                    <Box>
                      <Text fw={600} fz="sm">
                        {n.name}
                      </Text>
                      <Text fz="xs" c="dimmed">
                        {n.address}
                      </Text>
                    </Box>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <StatusDot status={n.status} pulse={n.isConnected} />
                </Table.Td>
                <Table.Td>{n.usersOnline.toLocaleString()}</Table.Td>
                <Table.Td>
                  <Text fz="sm">
                    {n.cpuPercent}% / {n.ramPercent}%
                  </Text>
                </Table.Td>
                <Table.Td>{formatBytes(n.trafficUsedBytes)}</Table.Td>
                <Table.Td>
                  <Text fz="sm" c="dimmed">
                    {n.xrayVersion ?? '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <NodeActions node={n} />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </GlassCard>
  );
}

function CreateNodeModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const create = useCreateNode();
  const { data: profiles = [] } = useProfiles();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [port, setPort] = useState<number | string>(2222);
  const [country, setCountry] = useState('');
  const [profile, setProfile] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Default to the first available config profile.
  useEffect(() => {
    if (opened && !profile && profiles.length > 0) setProfile(profiles[0].uuid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, profiles]);

  const selectedProfile = profiles.find((p) => p.uuid === profile);
  const inbounds = selectedProfile?.inbounds ?? [];
  const nameOk = name.trim().length >= 3;
  const canCreate = nameOk && address.trim().length >= 2 && !!profile;

  const submit = () => {
    setErr(null);
    create.mutate(
      {
        name: name.trim(),
        address: address.trim(),
        port: Number(port) || 2222,
        countryCode: (country || 'XX').toUpperCase().slice(0, 2),
        activeConfigProfileUuid: profile,
        activeInbounds: inbounds.map((i) => i.uuid),
      },
      {
        onSuccess: () => {
          notifications.show({ message: t('nodes.created'), color: 'teal' });
          onClose();
          setName('');
          setAddress('');
          setCountry('');
          setErr(null);
        },
        onError: (e: unknown) => {
          const data = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data;
          const m = Array.isArray(data?.message) ? data?.message.join('; ') : data?.message;
          setErr(m || t('errors.generic'));
        },
      },
    );
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<Title order={3}>{t('nodes.create')}</Title>} size="md">
      <Stack gap="md">
        <TextInput
          label={t('common.name')}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Frankfurt Core"
          error={name.length > 0 && !nameOk ? '≥ 3' : undefined}
        />
        <Group grow>
          <TextInput label={t('nodes.address')} value={address} onChange={(e) => setAddress(e.currentTarget.value)} placeholder="49.12.10.20" />
          <NumberInput label={t('nodes.port')} value={port} onChange={setPort} min={1} max={65535} />
        </Group>
        <Group grow>
          <TextInput label={t('nodes.country')} value={country} onChange={(e) => setCountry(e.currentTarget.value)} placeholder="DE" maxLength={2} />
          <Select
            label={t('nodes.profile')}
            placeholder={t('nodes.selectProfile')}
            data={profiles.map((p) => ({ value: p.uuid, label: p.name }))}
            value={profile}
            onChange={setProfile}
            allowDeselect={false}
          />
        </Group>
        {profile && (
          <Box>
            <Text fz="xs" c="dimmed" mb={4}>
              {t('nodes.inbounds')}: {inbounds.length}
            </Text>
            <Group gap={6}>
              {inbounds.map((ib) => (
                <Badge key={ib.uuid} size="sm" variant="default" radius="sm">
                  {ib.tag}
                </Badge>
              ))}
            </Group>
          </Box>
        )}
        {err && (
          <Text c="red.4" fz="sm">
            {err}
          </Text>
        )}
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={submit}
            loading={create.isPending}
            disabled={!canCreate}
            variant="gradient"
            gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
          >
            {t('common.create')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function InstallWizard({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [secret, setSecret] = useState('');

  useEffect(() => {
    if (opened && !secret) {
      SphereApi.keygen()
        .then((k) => setSecret(k.secretKey || ''))
        .catch(() => setSecret(''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const command = `SECRET_KEY="${secret || '<SECRET_KEY ниже>'}" bash <(curl -Ls https://raw.githubusercontent.com/SKINOREZZZ101/SPHEREGHOST/main/scripts/install-node.sh)`;

  const steps = [
    t('nodes.installStep1'),
    t('nodes.installStep2'),
    t('nodes.installStep3'),
    t('nodes.installStep4'),
  ];

  return (
    <Modal opened={opened} onClose={onClose} title={<Title order={3}>{t('nodes.installTitle')}</Title>} size="lg">
      <Stack gap="md">
        <Text c="dimmed" fz="sm">
          {t('nodes.installDesc')}
        </Text>

        <Stack gap="xs">
          {steps.map((s, i) => (
            <Group key={i} gap="sm" wrap="nowrap" align="flex-start">
              <Box
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(124,92,255,0.15)',
                  border: '1px solid rgba(124,92,255,0.3)',
                  color: 'var(--gs-ghost)',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </Box>
              <Text fz="sm">{s}</Text>
            </Group>
          ))}
        </Stack>

        <CodeBlock label={t('nodes.copyCommand')} value={command} />
        <CodeBlock label={t('nodes.secretKey')} value={secret || '…'} mono />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            {t('common.close')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function CodeBlock({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Box>
      <Group justify="space-between" mb={6}>
        <Text fz="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
          {label}
        </Text>
        <Tooltip label={label}>
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={() => {
              void copyToClipboard(value);
              notifications.show({ message: 'Copied', color: 'teal' });
            }}
          >
            <IconDownload size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Box
        style={{
          padding: '12px 14px',
          borderRadius: 12,
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid var(--gs-border)',
          fontFamily: mono ? 'var(--gs-font-mono)' : 'var(--gs-font-mono)',
          fontSize: 12.5,
          color: 'var(--gs-spectre)',
          wordBreak: 'break-all',
          maxHeight: 120,
          overflow: 'auto',
        }}
      >
        {value}
      </Box>
    </Box>
  );
}
