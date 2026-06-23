import { Box, ScrollArea, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Logo } from '@shared/ui/Logo';
import { NAV } from '../navigation';
import { useStats } from '@shared/api/hooks';
import { StatusDot } from '@shared/ui/StatusDot';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { data: stats } = useStats();

  return (
    <Box
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, rgba(20,20,29,0.65), rgba(10,10,15,0.55))',
        borderRight: '1px solid var(--gs-border)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <Box px="lg" py="lg">
        <Logo size={34} />
      </Box>
      <Box className="gs-hairline" mx="lg" mb="xs" />

      <ScrollArea style={{ flex: 1 }} scrollbarSize={6} type="hover" px="sm">
        <Stack gap="lg" py="xs">
          {NAV.map((group) => (
            <Box key={group.titleKey}>
              <Text
                px="sm"
                fz={10}
                fw={700}
                c="dimmed"
                tt="uppercase"
                mb={6}
                style={{ letterSpacing: '0.16em' }}
              >
                {t(group.titleKey)}
              </Text>
              <Stack gap={2}>
                {group.items.map((item) => {
                  const active =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path);
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onNavigate}
                      style={{ textDecoration: 'none' }}
                    >
                      <UnstyledButton
                        component="div"
                        style={{
                          position: 'relative',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '9px 12px',
                          borderRadius: 11,
                          color: active ? '#fff' : 'var(--gs-text)',
                          background: active
                            ? `linear-gradient(135deg, ${item.accent}22, ${item.accent}08)`
                            : 'transparent',
                          border: `1px solid ${active ? `${item.accent}40` : 'transparent'}`,
                          transition: 'all 0.18s ease',
                        }}
                        className="gs-nav-item"
                      >
                        {active && (
                          <motion.div
                            layoutId="nav-active"
                            style={{
                              position: 'absolute',
                              left: -9,
                              top: '50%',
                              translateY: '-50%',
                              width: 3,
                              height: 22,
                              borderRadius: 2,
                              background: item.accent,
                              boxShadow: `0 0 10px ${item.accent}`,
                            }}
                          />
                        )}
                        <Icon
                          size={19}
                          stroke={1.8}
                          color={active ? item.accent : 'currentColor'}
                          style={{ flexShrink: 0 }}
                        />
                        <Text fz="sm" fw={active ? 650 : 500}>
                          {t(item.labelKey)}
                        </Text>
                      </UnstyledButton>
                    </NavLink>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      </ScrollArea>

      <Box p="sm">
        <Tooltip label={t('dashboard.health')} position="top">
          <Box
            className="gs-glass"
            style={{ borderRadius: 13, padding: '10px 12px' }}
          >
            <StatusDot
              status={stats?.health ?? 'operational'}
              pulse
              label={
                stats?.health === 'operational'
                  ? t('dashboard.allOperational')
                  : stats?.health === 'degraded'
                    ? t('dashboard.degraded')
                    : t('dashboard.down')
              }
            />
            <Text fz={11} c="dimmed" mt={6}>
              {stats?.onlineNodes ?? 0}/{stats?.totalNodes ?? 0} {t('dashboard.nodesOnline').toLowerCase()} ·{' '}
              {stats?.onlineUsers ?? 0} {t('common.online').toLowerCase()}
            </Text>
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
}
