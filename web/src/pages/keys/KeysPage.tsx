import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCertificate,
  IconCirclePlus,
  IconCopy,
  IconKey,
  IconLock,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { useTokens } from '@shared/api/hooks';
import { SphereApi } from '@shared/api/sphere';
import { copyToClipboard, formatDate } from '@shared/lib/format';

export default function KeysPage() {
  const { t, i18n } = useTranslation();
  const { data: tokens = [], refetch } = useTokens();
  const [createOpen, createCtl] = useDisclosure(false);
  const [name, setName] = useState('');
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [keys, setKeys] = useState<{ privateKey: string; publicKey: string } | null>(null);

  const createToken = async () => {
    const res = await SphereApi.createToken(name || 'token');
    setCreatedToken(res.token);
    void refetch();
  };

  const genKeys = async () => {
    setKeys(await SphereApi.generateX25519());
    notifications.show({ message: t('keys.x25519'), color: 'grape' });
  };

  return (
    <Page title={t('keys.title')} subtitle={t('keys.subtitle')} icon={<IconKey size={24} />}>
      <Tabs defaultValue="tokens" variant="pills" radius="md">
        <Tabs.List mb="lg">
          <Tabs.Tab value="tokens" leftSection={<IconKey size={16} />}>
            {t('keys.apiTokens')}
          </Tabs.Tab>
          <Tabs.Tab value="node" leftSection={<IconCertificate size={16} />}>
            {t('keys.nodeKeys')}
          </Tabs.Tab>
          <Tabs.Tab value="vault" leftSection={<IconLock size={16} />}>
            {t('keys.vault')}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="tokens">
          <GlassCard>
            <Group justify="space-between" mb="md">
              <Title order={4} fz="md">
                {t('keys.apiTokens')}
              </Title>
              <Button
                size="compact-sm"
                leftSection={<IconCirclePlus size={14} />}
                onClick={() => {
                  setCreatedToken(null);
                  setName('');
                  createCtl.open();
                }}
              >
                {t('keys.createToken')}
              </Button>
            </Group>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('keys.tokenName')}</Table.Th>
                  <Table.Th>{t('keys.tokenValue')}</Table.Th>
                  <Table.Th>{t('common.created')}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {tokens.map((tok) => (
                  <Table.Tr key={tok.uuid}>
                    <Table.Td>
                      <Text fw={600} fz="sm">
                        {tok.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz="sm" style={{ fontFamily: 'var(--gs-font-mono)' }} c="spectre.4">
                        {tok.tokenPreview}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz="sm" c="dimmed">
                        {formatDate(tok.createdAt, i18n.language)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="flex-end">
                        <ActionIcon variant="subtle" color="red">
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </GlassCard>
        </Tabs.Panel>

        <Tabs.Panel value="node">
          <GlassCard>
            <Title order={4} fz="md" mb={6}>
              {t('keys.keygen')}
            </Title>
            <Text c="dimmed" fz="sm" mb="md">
              {t('keys.keygenDesc')}
            </Text>
            <Button leftSection={<IconRefresh size={16} />} variant="default" onClick={genKeys}>
              {t('keys.generateX25519')}
            </Button>
            {keys && (
              <Stack gap="sm" mt="md">
                <SecretRow label={t('keys.privateKey')} value={keys.privateKey} />
                <SecretRow label={t('keys.publicKey')} value={keys.publicKey} />
              </Stack>
            )}
          </GlassCard>
        </Tabs.Panel>

        <Tabs.Panel value="vault">
          <GlassCard>
            <Group justify="space-between" mb="md">
              <Box>
                <Title order={4} fz="md">
                  {t('keys.vault')}
                </Title>
                <Text c="dimmed" fz="sm">
                  {t('keys.vaultDesc')}
                </Text>
              </Box>
              <Button size="compact-sm" variant="default" leftSection={<IconCirclePlus size={14} />}>
                {t('keys.addSecret')}
              </Button>
            </Group>
            <Stack gap="sm">
              {[
                { name: 'TELEGRAM_BOT_TOKEN', kind: 'bot' },
                { name: 'CLOUDFLARE_API_KEY', kind: 'infra' },
                { name: 'S3_SECRET_KEY', kind: 'backup' },
              ].map((s) => (
                <SecretRow key={s.name} label={s.name} value="••••••••••••••••••••••••••" badge={s.kind} />
              ))}
            </Stack>
          </GlassCard>
        </Tabs.Panel>
      </Tabs>

      <Modal opened={createOpen} onClose={createCtl.close} title={<Title order={3}>{t('keys.createToken')}</Title>}>
        {createdToken ? (
          <Stack gap="md">
            <Text fz="sm" c="ember.4">
              {t('keys.tokenCreated')}
            </Text>
            <SecretRow label={name} value={createdToken} revealed />
            <Button onClick={createCtl.close}>{t('common.close')}</Button>
          </Stack>
        ) : (
          <Stack gap="md">
            <TextInput
              label={t('keys.tokenName')}
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Ghost Sphere Core"
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={createCtl.close}>
                {t('common.cancel')}
              </Button>
              <Button onClick={createToken} disabled={!name}>
                {t('common.create')}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Page>
  );
}

function SecretRow({
  label,
  value,
  badge,
  revealed: initiallyRevealed,
}: {
  label: string;
  value: string;
  badge?: string;
  revealed?: boolean;
}) {
  const [revealed, setRevealed] = useState(!!initiallyRevealed);
  return (
    <Group
      justify="space-between"
      wrap="nowrap"
      style={{
        padding: '10px 14px',
        borderRadius: 12,
        background: 'rgba(0,0,0,0.32)',
        border: '1px solid var(--gs-border)',
      }}
    >
      <Box style={{ minWidth: 0 }}>
        <Group gap={8}>
          <Text fz="xs" c="dimmed">
            {label}
          </Text>
          {badge && (
            <Badge size="xs" variant="default">
              {badge}
            </Badge>
          )}
        </Group>
        <Text fz="sm" style={{ fontFamily: 'var(--gs-font-mono)', wordBreak: 'break-all' }} c="spectre.4">
          {revealed ? value : value.replace(/./g, '•').slice(0, 30)}
        </Text>
      </Box>
      <Group gap={4} wrap="nowrap">
        <Tooltip label={revealed ? 'Hide' : 'Reveal'}>
          <ActionIcon variant="subtle" onClick={() => setRevealed((r) => !r)}>
            <IconLock size={15} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Copy">
          <ActionIcon
            variant="subtle"
            onClick={() => {
              void copyToClipboard(value);
              notifications.show({ message: 'Copied', color: 'teal' });
            }}
          >
            <IconCopy size={15} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}
