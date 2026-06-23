import {
  ActionIcon,
  Badge,
  Box,
  Burger,
  Group,
  Menu,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { spotlight } from '@mantine/spotlight';
import {
  IconBell,
  IconLanguage,
  IconLogout,
  IconSearch,
  IconSettings,
  IconWorldBolt,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import i18n, { SUPPORTED_LANGUAGES } from '@shared/i18n/i18n';
import { useSession } from '@entities/session/session.store';
import { APP } from '@shared/config';

interface TopbarProps {
  navOpened: boolean;
  onToggleNav: () => void;
}

export function Topbar({ navOpened, onToggleNav }: TopbarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mode = useSession((s) => s.mode);
  const logout = useSession((s) => s.logout);
  const connection = useSession((s) => s.connection);

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        <Burger opened={navOpened} onClick={onToggleNav} hiddenFrom="md" size="sm" />
        <UnstyledButton
          onClick={spotlight.open}
          className="gs-glass"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 14px',
            borderRadius: 11,
            minWidth: 220,
            color: 'var(--gs-text)',
          }}
          visibleFrom="xs"
        >
          <IconSearch size={16} stroke={1.8} />
          <Text fz="sm" c="dimmed">
            {t('common.search')}
          </Text>
          <Box style={{ marginLeft: 'auto' }}>
            <Badge size="xs" variant="default" radius="sm">
              Ctrl K
            </Badge>
          </Box>
        </UnstyledButton>
        <ActionIcon onClick={spotlight.open} variant="default" size="lg" hiddenFrom="xs">
          <IconSearch size={18} />
        </ActionIcon>
      </Group>

      <Group gap="xs" wrap="nowrap">
        <Tooltip label={mode === 'demo' ? t('common.demoMode') : connection?.name}>
          <Badge
            variant="light"
            color={mode === 'demo' ? 'ember' : 'toxic'}
            leftSection={mode === 'demo' ? <IconWorldBolt size={12} /> : <span className="gs-live-dot" style={{ width: 7, height: 7 }} />}
            radius="sm"
            visibleFrom="sm"
          >
            {mode === 'demo' ? t('common.demoMode') : t('common.online')}
          </Badge>
        </Tooltip>

        <Menu shadow="lg" width={170} position="bottom-end" radius="md">
          <Menu.Target>
            <Tooltip label={t('common.language')}>
              <ActionIcon variant="default" size="lg">
                <IconLanguage size={18} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{t('settings.language')}</Menu.Label>
            {SUPPORTED_LANGUAGES.map((lng) => (
              <Menu.Item
                key={lng.code}
                onClick={() => void i18n.changeLanguage(lng.code)}
                leftSection={<span style={{ fontSize: 16 }}>{lng.flag}</span>}
                style={{ fontWeight: i18n.language === lng.code ? 700 : 400 }}
              >
                {lng.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        <Tooltip label={t('dashboard.recentActivity')}>
          <ActionIcon variant="default" size="lg" onClick={() => navigate('/')}>
            <IconBell size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label={t('nav.settings')}>
          <ActionIcon variant="default" size="lg" onClick={() => navigate('/settings')}>
            <IconSettings size={18} />
          </ActionIcon>
        </Tooltip>

        <Menu shadow="lg" width={220} position="bottom-end" radius="md">
          <Menu.Target>
            <UnstyledButton>
              <Box
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, #7c5cff, #22d3ee)',
                  color: '#fff',
                  fontWeight: 800,
                  fontFamily: 'var(--gs-font-display)',
                }}
              >
                G
              </Box>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{connection?.name ?? APP.name}</Menu.Label>
            <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => navigate('/settings')}>
              {t('nav.settings')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={logout}>
              {t('common.logout')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
