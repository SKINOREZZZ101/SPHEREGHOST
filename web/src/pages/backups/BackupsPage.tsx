import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Grid,
  Group,
  Modal,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBrandTelegram,
  IconCloudUpload,
  IconDatabaseExport,
  IconDownload,
  IconFolder,
  IconRestore,
  IconServer,
} from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { EmptyState } from '@shared/ui/EmptyState';
import { StatusDot } from '@shared/ui/StatusDot';
import { useBackups, useCreateBackup } from '@shared/api/hooks';
import { formatBytes, formatDateTime } from '@shared/lib/format';
import type { BackupDestination, GsBackup } from '@shared/api/types';

const DEST_ICON: Record<BackupDestination, typeof IconFolder> = {
  local: IconFolder,
  s3: IconCloudUpload,
  gdrive: IconCloudUpload,
  telegram: IconBrandTelegram,
};

export default function BackupsPage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const { data: backups = [] } = useBackups();
  const [createOpen, createCtl] = useDisclosure(false);
  const [autoBackup, setAutoBackup] = useState(true);

  useEffect(() => {
    if (params.get('create') === '1') {
      createCtl.open();
      params.delete('create');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page
      title={t('backups.title')}
      subtitle={t('backups.subtitle')}
      icon={<IconDatabaseExport size={24} />}
      actions={
        <Button
          leftSection={<IconDatabaseExport size={16} />}
          onClick={createCtl.open}
          variant="gradient"
          gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
        >
          {t('backups.create')}
        </Button>
      }
    >
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <GlassCard p={0}>
            <Title order={4} fz="md" p="md">
              {t('backups.history')}
            </Title>
            {backups.length === 0 ? (
              <EmptyState title={t('backups.emptyTitle')} description={t('backups.emptyDesc')} />
            ) : (
              <Table.ScrollContainer minWidth={620}>
                <Table verticalSpacing="sm" horizontalSpacing="lg" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t('common.created')}</Table.Th>
                      <Table.Th>{t('backups.destination')}</Table.Th>
                      <Table.Th>{t('backups.size')}</Table.Th>
                      <Table.Th>{t('common.status')}</Table.Th>
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {backups.map((b) => (
                      <BackupRow key={b.id} backup={b} lang={i18n.language} />
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </GlassCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <GlassCard>
            <Group justify="space-between" mb="md">
              <Title order={4} fz="md">
                {t('backups.autoBackup')}
              </Title>
              <Switch checked={autoBackup} onChange={(e) => setAutoBackup(e.currentTarget.checked)} />
            </Group>
            <Stack gap="md">
              <TextInput label={t('backups.cron')} defaultValue="0 4 * * *" disabled={!autoBackup} />
              <Select
                label={t('backups.destination')}
                defaultValue="telegram"
                disabled={!autoBackup}
                data={[
                  { value: 'local', label: t('backups.destLocal') },
                  { value: 's3', label: t('backups.destS3') },
                  { value: 'gdrive', label: t('backups.destGdrive') },
                  { value: 'telegram', label: t('backups.destTelegram') },
                ]}
              />
              <Select
                label={t('backups.retention')}
                defaultValue="14"
                disabled={!autoBackup}
                data={['7', '14', '30', '90'].map((v) => ({ value: v, label: v }))}
              />
              <Group gap="sm" mt="xs">
                <StatusDot status={autoBackup ? 'operational' : 'offline'} pulse={autoBackup} />
                <Text fz="sm" c="dimmed">
                  {autoBackup ? t('status.operational') : t('common.disabled')}
                </Text>
              </Group>
            </Stack>
          </GlassCard>
        </Grid.Col>
      </Grid>

      <CreateBackupModal opened={createOpen} onClose={createCtl.close} />
    </Page>
  );
}

function BackupRow({ backup, lang }: { backup: GsBackup; lang: string }) {
  const { t } = useTranslation();
  const Icon = DEST_ICON[backup.destination];
  return (
    <Table.Tr>
      <Table.Td>
        <Text fz="sm">{formatDateTime(backup.createdAt, lang)}</Text>
        <Group gap={4} mt={2}>
          {backup.includesDb && (
            <Badge size="xs" variant="default" leftSection={<IconServer size={9} />}>
              DB
            </Badge>
          )}
          {backup.includesPanel && (
            <Badge size="xs" variant="default">
              panel
            </Badge>
          )}
          {backup.includesBots && (
            <Badge size="xs" variant="default">
              bots
            </Badge>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap={6}>
          <Icon size={16} color="var(--gs-spectre)" />
          <Text fz="sm" tt="capitalize">
            {backup.destination}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>{formatBytes(backup.sizeBytes)}</Table.Td>
      <Table.Td>
        <StatusDot status={backup.status} />
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="flex-end">
          <Button size="compact-xs" variant="subtle" leftSection={<IconDownload size={13} />}>
            {t('common.download')}
          </Button>
          <Button size="compact-xs" variant="subtle" color="ghost" leftSection={<IconRestore size={13} />}>
            {t('backups.restore')}
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

function CreateBackupModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const create = useCreateBackup();
  const [dest, setDest] = useState<BackupDestination>('local');
  const [db, setDb] = useState(true);
  const [panel, setPanel] = useState(true);
  const [bots, setBots] = useState(false);

  const submit = () => {
    create.mutate(
      { destination: dest, includesDb: db, includesPanel: panel, includesBots: bots },
      {
        onSuccess: () => {
          notifications.show({ message: t('common.success'), color: 'teal' });
          onClose();
        },
      },
    );
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<Title order={3}>{t('backups.create')}</Title>}>
      <Stack gap="md">
        <Select
          label={t('backups.destination')}
          value={dest}
          onChange={(v) => setDest((v as BackupDestination) ?? 'local')}
          data={[
            { value: 'local', label: t('backups.destLocal') },
            { value: 's3', label: t('backups.destS3') },
            { value: 'gdrive', label: t('backups.destGdrive') },
            { value: 'telegram', label: t('backups.destTelegram') },
          ]}
        />
        <Stack gap="xs">
          <Checkbox label={t('backups.includeDb')} checked={db} onChange={(e) => setDb(e.currentTarget.checked)} />
          <Checkbox label={t('backups.includePanel')} checked={panel} onChange={(e) => setPanel(e.currentTarget.checked)} />
          <Checkbox label={t('backups.includeBots')} checked={bots} onChange={(e) => setBots(e.currentTarget.checked)} />
        </Stack>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={submit}
            loading={create.isPending}
            variant="gradient"
            gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
          >
            {t('backups.create')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
