import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Progress,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandDocker,
  IconCheck,
  IconCircleCheck,
  IconCopy,
  IconCpu,
  IconKey,
  IconSparkles,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { GhostLoader } from '@shared/ui/GhostLoader';
import { useCreateNode, useProfiles } from '@shared/api/hooks';
import { SphereApi } from '@shared/api/sphere';
import { copyToClipboard, countryFlag } from '@shared/lib/format';
import { nodeDockerCompose, nodeInstallCommand } from '@shared/lib/node-compose';

const COUNTRY_OPTIONS = [
  'RU', 'DE', 'NL', 'FI', 'PL', 'FR', 'GB', 'US', 'JP', 'SG', 'TR', 'AE', 'HK', 'SE', 'CH', 'XX',
].map((c) => ({ value: c, label: `${countryFlag(c)} ${c}` }));

interface NodeWizardProps {
  opened: boolean;
  onClose: () => void;
}

export function NodeWizard({ opened, onClose }: NodeWizardProps) {
  const { t } = useTranslation();
  const create = useCreateNode();
  const { data: profiles = [] } = useProfiles();

  const [step, setStep] = useState(0);
  const [secret, setSecret] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('XX');
  const [address, setAddress] = useState('');
  const [port, setPort] = useState<number | string>(2222);
  const [profile, setProfile] = useState<string | null>(null);
  const [connectState, setConnectState] = useState<'idle' | 'connecting' | 'done' | 'error'>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setStep(0);
      setConnectState('idle');
      setErrText(null);
      SphereApi.keygen().then((k) => setSecret(k.secretKey || '')).catch(() => setSecret(''));
    }
  }, [opened]);

  useEffect(() => {
    if (opened && !profile && profiles.length > 0) setProfile(profiles[0].uuid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, profiles]);

  const selectedProfile = profiles.find((p) => p.uuid === profile);
  const inbounds = selectedProfile?.inbounds ?? [];
  const compose = useMemo(() => nodeDockerCompose(secret, Number(port) || 2222), [secret, port]);
  const installCmd = useMemo(() => nodeInstallCommand(secret), [secret]);

  const step1Valid = name.trim().length >= 3 && address.trim().length >= 2;

  const copy = async (value: string, label: string) => {
    const ok = await copyToClipboard(value);
    notifications.show({
      message: ok ? label : 'Не удалось скопировать — выделите текст вручную',
      color: ok ? 'teal' : 'red',
    });
  };

  const createNode = () => {
    setConnectState('connecting');
    setErrText(null);
    setStep(2);
    create.mutate(
      {
        name: name.trim(),
        address: address.trim(),
        port: Number(port) || 2222,
        countryCode: country,
        activeConfigProfileUuid: profile,
        activeInbounds: inbounds.map((i) => i.uuid),
      },
      {
        onSuccess: () => {
          // Give the engine a moment to begin the mTLS handshake.
          setTimeout(() => setConnectState('done'), 2200);
        },
        onError: (e: unknown) => {
          const data = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data;
          const m = Array.isArray(data?.message) ? data?.message.join('; ') : data?.message;
          setErrText(m || t('errors.generic'));
          setConnectState('error');
        },
      },
    );
  };

  const progress = step === 0 ? 33 : step === 1 ? 66 : 100;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      withCloseButton={false}
      padding={0}
      styles={{ content: { overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box p="lg" pb="sm">
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <ThemeIcon size={40} radius="md" variant="light" color="ghost">
              <IconCpu size={22} />
            </ThemeIcon>
            <Text fw={700} fz="xl" style={{ fontFamily: 'var(--gs-font-display)' }}>
              {t('nodes.create')}
            </Text>
          </Group>
          <ActionIcon variant="subtle" color="gray" onClick={onClose}>
            <IconArrowLeft size={18} style={{ display: 'none' }} />
            <span style={{ fontSize: 20, lineHeight: 1 }}>×</span>
          </ActionIcon>
        </Group>
        <Progress
          value={progress}
          size="sm"
          radius="xl"
          color="ghost"
          striped
          animated={connectState === 'connecting'}
        />
      </Box>

      <Box px="lg" pb="lg">
        {/* STEP 1 — Secret key + connection params */}
        {step === 0 && (
          <Stack gap="md">
            <Text c="dimmed" fz="sm">
              {t('nodes.installDesc')}
            </Text>

            <Box>
              <Group justify="space-between" mb={4}>
                <Text fz="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                  Secret Key (SECRET_KEY)
                </Text>
                <Tooltip label={t('common.copy')}>
                  <ActionIcon size="sm" variant="subtle" onClick={() => copy(secret, t('common.copied'))}>
                    <IconCopy size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Box
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--gs-border)',
                  fontFamily: 'var(--gs-font-mono)',
                  fontSize: 12,
                  color: 'var(--gs-spectre)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {secret || '…'}
              </Box>
            </Box>

            <TextInput
              label={t('nodes.create') + ' — ' + t('common.name')}
              placeholder="US-NY-Node-01"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              leftSection={<IconKey size={15} />}
              withAsterisk
            />
            <Select
              label={t('nodes.country')}
              data={COUNTRY_OPTIONS}
              value={country}
              onChange={(v) => setCountry(v ?? 'XX')}
              searchable
              allowDeselect={false}
            />
            <Group grow>
              <TextInput
                label={t('nodes.address')}
                placeholder="192.168.1.1"
                value={address}
                onChange={(e) => setAddress(e.currentTarget.value)}
                withAsterisk
              />
              <NumberInput label="Node Port" value={port} onChange={setPort} min={1} max={65535} withAsterisk />
            </Group>

            <Group grow mt={4}>
              <Button
                variant="default"
                leftSection={<IconBrandDocker size={16} />}
                onClick={() => copy(compose, 'docker-compose.yml ' + t('common.copied'))}
              >
                docker-compose.yml
              </Button>
              <Button
                variant="default"
                leftSection={<IconCopy size={16} />}
                onClick={() => copy(installCmd, t('common.copied'))}
              >
                {t('nodes.copyCommand')}
              </Button>
            </Group>

            <Group justify="flex-end" mt="xs">
              <Button
                onClick={() => setStep(1)}
                disabled={!step1Valid}
                rightSection={<IconArrowRight size={16} />}
                variant="gradient"
                gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
              >
                {t('common.next')}
              </Button>
            </Group>
          </Stack>
        )}

        {/* STEP 2 — Profile / inbounds */}
        {step === 1 && (
          <Stack gap="md">
            <Group gap="sm">
              <IconSparkles size={18} color="var(--gs-ghost)" />
              <Text fw={650}>{t('configs.profiles')}</Text>
            </Group>
            <Text c="dimmed" fz="sm">
              {t('nodes.selectProfile')}
            </Text>

            <Select
              data={profiles.map((p) => ({ value: p.uuid, label: p.name }))}
              value={profile}
              onChange={setProfile}
              placeholder={t('nodes.selectProfile')}
              allowDeselect={false}
            />

            {selectedProfile && (
              <Box
                className="gs-glass"
                style={{ borderRadius: 12, padding: 14 }}
              >
                <Group justify="space-between" mb="sm">
                  <Text fw={650}>{selectedProfile.name}</Text>
                  <Badge variant="light" color="ghost">
                    {inbounds.length} {t('nodes.inbounds')}
                  </Badge>
                </Group>
                <Group gap={6}>
                  {inbounds.map((ib) => (
                    <Badge key={ib.uuid} size="sm" variant="default" radius="sm">
                      {ib.tag}
                    </Badge>
                  ))}
                  {inbounds.length === 0 && (
                    <Text fz="xs" c="dimmed">
                      {t('common.empty')}
                    </Text>
                  )}
                </Group>
              </Box>
            )}

            <Group justify="space-between" mt="xs">
              <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={() => setStep(0)}>
                {t('common.back')}
              </Button>
              <Button
                onClick={createNode}
                disabled={!profile}
                loading={create.isPending}
                leftSection={<IconCheck size={16} />}
                variant="gradient"
                gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
              >
                {t('nodes.create')}
              </Button>
            </Group>
          </Stack>
        )}

        {/* STEP 3 — mTLS connecting animation */}
        {step === 2 && (
          <Stack gap="lg" align="center" py="md">
            <Box
              className="gs-glass"
              style={{ width: '100%', borderRadius: 16, padding: '28px 16px', display: 'grid', placeItems: 'center' }}
            >
              {connectState === 'done' ? (
                <Stack align="center" gap="sm">
                  <ThemeIcon size={68} radius="xl" variant="light" color="toxic">
                    <IconCircleCheck size={40} />
                  </ThemeIcon>
                  <Badge color="toxic" variant="light" size="lg">
                    {t('nodes.created')}
                  </Badge>
                </Stack>
              ) : connectState === 'error' ? (
                <Stack align="center" gap="sm">
                  <Text c="red.4" fw={650}>
                    {t('errors.generic')}
                  </Text>
                  <Text c="dimmed" fz="sm" ta="center" maw={360}>
                    {errText}
                  </Text>
                </Stack>
              ) : (
                <Stack align="center" gap="md">
                  <GhostLoader size={84} label="CONNECTING" />
                  <Text c="dimmed" fz="sm">
                    {t('nodes.installStep4')}
                  </Text>
                </Stack>
              )}
            </Box>

            {connectState === 'connecting' && (
              <Box
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(46,229,163,0.08)',
                  border: '1px solid rgba(46,229,163,0.25)',
                }}
              >
                <Group gap="sm">
                  <IconCircleCheck size={18} color="var(--gs-toxic)" />
                  <Text fz="sm">{t('status.pending')}…</Text>
                </Group>
              </Box>
            )}

            <Group justify="space-between" w="100%">
              <Button variant="default" onClick={onClose}>
                {t('common.close')}
              </Button>
              {connectState === 'done' && (
                <Button
                  variant="gradient"
                  gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
                  onClick={onClose}
                >
                  {t('nodes.title')}
                </Button>
              )}
            </Group>
          </Stack>
        )}
      </Box>
    </Modal>
  );
}
