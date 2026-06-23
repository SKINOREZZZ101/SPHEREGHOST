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
  Pagination,
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
  IconCopy,
  IconDotsVertical,
  IconKey,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconSearch,
  IconUsers,
} from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { EmptyState } from '@shared/ui/EmptyState';
import { Meter } from '@shared/ui/Meter';
import { useCreateUser, useUserAction, useUsers } from '@shared/api/hooks';
import { clampPercent, copyToClipboard, formatBytes, formatDate, timeAgo } from '@shared/lib/format';
import type { GsUser, UserStatus } from '@shared/api/types';

const STATUS_COLOR: Record<UserStatus, string> = {
  ACTIVE: 'toxic',
  DISABLED: 'gray',
  LIMITED: 'ember',
  EXPIRED: 'red',
};
const PAGE_SIZE = 12;

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const { data: users = [], isLoading } = useUsers();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, createCtl] = useDisclosure(false);

  useEffect(() => {
    if (params.get('create') === '1') {
      createCtl.open();
      params.delete('create');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          (u.email ?? '').toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const counts = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === 'ACTIVE').length,
      online: users.filter((u) => u.isOnline).length,
      limited: users.filter((u) => u.status === 'LIMITED' || u.status === 'EXPIRED').length,
    }),
    [users],
  );

  return (
    <Page
      title={t('users.title')}
      subtitle={t('users.subtitle')}
      icon={<IconUsers size={24} />}
      actions={
        <Button
          leftSection={<IconCirclePlus size={16} />}
          onClick={createCtl.open}
          variant="gradient"
          gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
        >
          {t('users.add')}
        </Button>
      }
    >
      <Stack gap="lg">
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Mini label={t('dashboard.totalUsers')} value={counts.total} color="#7c5cff" />
          <Mini label={t('users.statusActive')} value={counts.active} color="#22ff7c" />
          <Mini label={t('users.online')} value={counts.online} color="#22d3ee" />
          <Mini label={t('users.statusLimited')} value={counts.limited} color="#ffa121" />
        </SimpleGrid>

        <GlassCard p={0}>
          <Group p="md" justify="space-between">
            <TextInput
              placeholder={t('common.search')}
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
              w={{ base: '100%', sm: 320 }}
            />
            <Text fz="sm" c="dimmed" visibleFrom="sm">
              {filtered.length} {t('common.of').toLowerCase()} {users.length}
            </Text>
          </Group>

          {isLoading ? (
            <Box className="gs-shimmer" style={{ height: 360 }} />
          ) : filtered.length === 0 ? (
            <EmptyState title={t('users.emptyTitle')} description={t('users.emptyDesc')} />
          ) : (
            <Table.ScrollContainer minWidth={820}>
              <Table verticalSpacing="sm" horizontalSpacing="lg" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('users.username')}</Table.Th>
                    <Table.Th>{t('common.status')}</Table.Th>
                    <Table.Th>{t('users.traffic')}</Table.Th>
                    <Table.Th>{t('users.expireAt')}</Table.Th>
                    <Table.Th>{t('users.online')}</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paged.map((u) => (
                    <UserRow key={u.uuid} user={u} lang={i18n.language} />
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}

          {totalPages > 1 && (
            <Group justify="center" p="md">
              <Pagination total={totalPages} value={page} onChange={setPage} radius="md" />
            </Group>
          )}
        </GlassCard>
      </Stack>

      <CreateUserModal opened={createOpen} onClose={createCtl.close} />
    </Page>
  );
}

function Mini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <GlassCard p="md">
      <Text fz="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
        {label}
      </Text>
      <Text fz={24} fw={720} mt={4} style={{ color, fontFamily: 'var(--gs-font-display)' }}>
        {value.toLocaleString()}
      </Text>
    </GlassCard>
  );
}

function UserRow({ user, lang }: { user: GsUser; lang: string }) {
  const { t } = useTranslation();
  const action = useUserAction();
  const pct = clampPercent(user.usedTrafficBytes, user.trafficLimitBytes);

  const run = (a: Parameters<typeof action.mutate>[0]['action']) =>
    action.mutate({ uuid: user.uuid, action: a }, { onSuccess: () => notifications.show({ message: t('common.success'), color: 'teal' }) });

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              background: `hsl(${(user.username.charCodeAt(0) * 7) % 360} 70% 22%)`,
              color: '#fff',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user.username[0]?.toUpperCase()}
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Text fw={600} fz="sm" truncate>
              {user.username}
            </Text>
            <Text fz="xs" c="dimmed" truncate style={{ fontFamily: 'var(--gs-font-mono)' }}>
              {user.shortUuid}
            </Text>
          </Box>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={STATUS_COLOR[user.status]} variant="light" radius="sm">
          {t(`users.status${user.status[0]}${user.status.slice(1).toLowerCase()}` as never)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Box w={150}>
          <Meter
            value={pct}
            right={`${formatBytes(user.usedTrafficBytes)} / ${formatBytes(user.trafficLimitBytes)}`}
            height={5}
          />
        </Box>
      </Table.Td>
      <Table.Td>
        <Text fz="sm" c="dimmed">
          {formatDate(user.expireAt, lang)}
        </Text>
      </Table.Td>
      <Table.Td>
        {user.isOnline ? (
          <span className="gs-live-dot" />
        ) : (
          <Text fz="xs" c="dimmed">
            {timeAgo(user.onlineAt, lang)}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="flex-end" wrap="nowrap">
          <Tooltip label={t('users.subscriptionLink')}>
            <ActionIcon
              variant="subtle"
              onClick={() => {
                void copyToClipboard(user.subscriptionUrl);
                notifications.show({ message: t('common.copied'), color: 'teal' });
              }}
            >
              <IconCopy size={16} />
            </ActionIcon>
          </Tooltip>
          <Menu shadow="lg" width={190} position="bottom-end" radius="md">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {user.status === 'DISABLED' ? (
                <Menu.Item leftSection={<IconPlayerPlay size={16} />} onClick={() => run('enable')}>
                  {t('users.enable')}
                </Menu.Item>
              ) : (
                <Menu.Item leftSection={<IconPlayerStop size={16} />} onClick={() => run('disable')}>
                  {t('users.disable')}
                </Menu.Item>
              )}
              <Menu.Item leftSection={<IconRefresh size={16} />} onClick={() => run('reset-traffic')}>
                {t('users.resetTraffic')}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconKey size={16} />}
                onClick={() =>
                  modals.openConfirmModal({
                    title: t('users.revoke'),
                    labels: { confirm: t('common.confirm'), cancel: t('common.cancel') },
                    onConfirm: () => run('revoke'),
                  })
                }
              >
                {t('users.revoke')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

function CreateUserModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const create = useCreateUser();
  const [username, setUsername] = useState('');
  const [limit, setLimit] = useState<number | string>(100);
  const [strategy, setStrategy] = useState<string>('MONTH');
  const [days, setDays] = useState<number | string>(30);

  const submit = () => {
    create.mutate(
      {
        username,
        trafficLimitBytes: Number(limit) * 1024 ** 3,
        trafficStrategy: strategy as GsUser['trafficStrategy'],
        expireAt: new Date(Date.now() + Number(days) * 86400000).toISOString(),
      },
      {
        onSuccess: () => {
          notifications.show({ message: t('common.success'), color: 'teal' });
          onClose();
          setUsername('');
        },
      },
    );
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<Title order={3}>{t('users.add')}</Title>}>
      <Stack gap="md">
        <TextInput
          label={t('users.username')}
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          placeholder="ghost_user"
        />
        <Group grow>
          <NumberInput label={`${t('users.trafficLimit')} (GB)`} value={limit} onChange={setLimit} min={0} />
          <NumberInput label={`${t('users.expireAt')} (days)`} value={days} onChange={setDays} min={1} />
        </Group>
        <Select
          label={t('users.strategy')}
          value={strategy}
          onChange={(v) => setStrategy(v ?? 'MONTH')}
          data={[
            { value: 'NO_RESET', label: t('users.strategyNoReset') },
            { value: 'DAY', label: t('users.strategyDay') },
            { value: 'WEEK', label: t('users.strategyWeek') },
            { value: 'MONTH', label: t('users.strategyMonth') },
          ]}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={submit}
            disabled={!username}
            loading={create.isPending}
            variant="gradient"
            gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
          >
            {t('users.createKey')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
