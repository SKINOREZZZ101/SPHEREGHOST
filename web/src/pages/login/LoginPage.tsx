import { useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  PasswordInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { motion } from 'framer-motion';
import {
  IconArrowRight,
  IconBolt,
  IconBraces,
  IconLanguage,
  IconLock,
  IconServerBolt,
  IconShieldLock,
  IconUser,
  IconWorldBolt,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { GhostSphereMark, Logo } from '@shared/ui/Logo';
import { ParticleField } from '@shared/ui/ParticleField';
import { useSession } from '@entities/session/session.store';
import i18n, { SUPPORTED_LANGUAGES } from '@shared/i18n/i18n';
import { APP } from '@shared/config';
import { login as apiLogin, register as apiRegister } from '@shared/api/auth';

const features = [
  { icon: IconServerBolt, key: 'nav.nodes', accent: '#22d3ee' },
  { icon: IconBraces, key: 'nav.configs', accent: '#a288f1' },
  { icon: IconBolt, key: 'nav.subscriptions', accent: '#22ff7c' },
  { icon: IconShieldLock, key: 'nav.keys', accent: '#ffa121' },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const loginDemo = useSession((s) => s.loginDemo);
  const loginLive = useSession((s) => s.loginLive);

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = username.trim().length >= 2 && password.length >= 4;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const fn = tab === 'register' ? apiRegister : apiLogin;
      const res = await fn(username.trim(), password);
      if (!res?.accessToken) throw new Error('no token');
      loginLive({ name: username.trim(), token: res.accessToken });
    } catch (e) {
      const data = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const msg = Array.isArray(data?.message) ? data?.message.join('; ') : data?.message;
      setError(msg || t('auth.loginFailed'));
      setBusy(false);
    }
  };

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      <ParticleField />
      <Box style={{ position: 'absolute', top: 20, right: 20, zIndex: 5 }}>
        <Menu shadow="lg" width={160} position="bottom-end" radius="md">
          <Menu.Target>
            <ActionIcon variant="default" size="lg">
              <IconLanguage size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {SUPPORTED_LANGUAGES.map((lng) => (
              <Menu.Item
                key={lng.code}
                onClick={() => void i18n.changeLanguage(lng.code)}
                leftSection={<span style={{ fontSize: 16 }}>{lng.flag}</span>}
              >
                {lng.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Box>

      {/* Left: brand showcase */}
      <Box
        visibleFrom="md"
        style={{
          flex: 1.1,
          padding: 64,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          borderRight: '1px solid var(--gs-border)',
        }}
      >
        <Logo size={40} />
        <Stack gap="xl" maw={520}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'relative', width: 220, height: 220 }}
          >
            <Box
              style={{
                position: 'absolute',
                inset: -40,
                background: 'radial-gradient(circle, rgba(124,92,255,0.3), transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            <Box style={{ position: 'relative' }}>
              <GhostSphereMark size={220} />
            </Box>
          </motion.div>

          <Stack gap="xs">
            <Title order={1} fz={44} lh={1.05} style={{ fontFamily: 'var(--gs-font-display)' }}>
              <span className="gs-gradient-text">Ghost</span> Sphere
            </Title>
            <Text fz="lg" c="dimmed" maw={440}>
              {t('brand.tagline')}
            </Text>
            <Text fz="sm" c="ghost.3" fs="italic" mt={4}>
              «{t('brand.motto')}»
            </Text>
          </Stack>

          <Group gap="md" mt="md">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Group gap={8}>
                    <Box
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        display: 'grid',
                        placeItems: 'center',
                        background: `${f.accent}1a`,
                        border: `1px solid ${f.accent}33`,
                        color: f.accent,
                      }}
                    >
                      <Icon size={18} stroke={1.8} />
                    </Box>
                    <Text fz="sm" fw={500}>
                      {t(f.key)}
                    </Text>
                  </Group>
                </motion.div>
              );
            })}
          </Group>
        </Stack>

        <Text fz="xs" c="dimmed">
          {APP.name} v{APP.version} · {t('brand.by')}
        </Text>
      </Box>

      {/* Right: login / register */}
      <Box style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <Box hiddenFrom="md" mb="xl">
            <Logo size={38} />
          </Box>

          <Box className="gs-glass gs-glow-ghost" style={{ borderRadius: 22, padding: 30 }}>
            <Stack gap="xs" mb="lg">
              <Title order={2}>{t('auth.welcome')}</Title>
              <Text c="dimmed" fz="sm">
                {t('auth.panelSubtitle')}
              </Text>
            </Stack>

            <SegmentedControl
              fullWidth
              value={tab}
              onChange={(v) => {
                setTab(v as 'login' | 'register');
                setError(null);
              }}
              data={[
                { value: 'login', label: t('auth.loginTab') },
                { value: 'register', label: t('auth.registerTab') },
              ]}
              mb="md"
            />

            <Stack gap="md">
              <TextInput
                label={t('auth.usernameField')}
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                leftSection={<IconUser size={16} />}
                size="md"
                autoComplete="username"
              />
              <PasswordInput
                label={t('auth.passwordField')}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                leftSection={<IconLock size={16} />}
                size="md"
                autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />

              {tab === 'register' && (
                <Text fz="xs" c="dimmed">
                  {t('auth.firstAdminHint')} {t('auth.passwordRule')}
                </Text>
              )}

              {error && (
                <Text c="red.4" fz="sm">
                  {error}
                </Text>
              )}

              <Button
                size="md"
                fullWidth
                loading={busy}
                disabled={!canSubmit}
                onClick={handleSubmit}
                rightSection={<IconArrowRight size={18} />}
                variant="gradient"
                gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
              >
                {busy
                  ? t('auth.connecting')
                  : tab === 'register'
                    ? t('auth.registerBtn')
                    : t('auth.signInBtn')}
              </Button>

              <Divider label={t('common.or')} labelPosition="center" my={2} />

              <Button
                size="md"
                fullWidth
                variant="default"
                leftSection={<IconWorldBolt size={18} />}
                onClick={loginDemo}
              >
                {t('auth.demo')}
              </Button>
              <Text fz="xs" c="dimmed" ta="center">
                {t('auth.demoDesc')}
              </Text>
            </Stack>

            <Group gap={6} mt="lg" justify="center" wrap="nowrap">
              <IconShieldLock size={14} color="var(--gs-spectre)" />
              <Text fz="xs" c="dimmed" ta="center">
                {t('auth.secureNote')}
              </Text>
            </Group>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}
