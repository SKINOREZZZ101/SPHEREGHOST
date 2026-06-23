import {
  Badge,
  Box,
  Button,
  Grid,
  Group,
  RingProgress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { AreaChart, BarChart } from '@mantine/charts';
import {
  IconActivity,
  IconArrowRight,
  IconBolt,
  IconDatabaseExport,
  IconServer2,
  IconUsers,
  IconWifi,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { StatCard } from '@shared/ui/StatCard';
import { StatusDot } from '@shared/ui/StatusDot';
import { Meter } from '@shared/ui/Meter';
import { GhostSphereMark } from '@shared/ui/Logo';
import {
  useActivity,
  useNodeLoad,
  useStats,
  useTrafficSeries,
  useUserGrowth,
} from '@shared/api/hooks';
import { formatBytes, formatNumber, formatUptime, timeAgo } from '@shared/lib/format';
import type { ActivityEvent } from '@shared/api/types';

const ACTIVITY_COLORS: Record<ActivityEvent['level'], string> = {
  info: '#22d3ee',
  success: '#22ff7c',
  warning: '#ffa121',
  error: '#ff4d6d',
};

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: stats } = useStats();
  const { data: growth = [] } = useUserGrowth();
  const { data: nodeLoad = [] } = useNodeLoad();
  const { data: traffic = [] } = useTrafficSeries();
  const { data: activity = [] } = useActivity();

  const spherePower = stats
    ? Math.round(((stats.onlineNodes / Math.max(1, stats.totalNodes)) * 0.6 + (stats.activeUsers / Math.max(1, stats.totalUsers)) * 0.4) * 100)
    : 0;

  return (
    <Page
      title={t('dashboard.title')}
      subtitle={t('dashboard.subtitle')}
      actions={
        <Group gap="xs">
          <Badge
            variant="light"
            color="toxic"
            leftSection={<span className="gs-live-dot" style={{ width: 7, height: 7 }} />}
            size="lg"
          >
            {t('dashboard.realtime')}
          </Badge>
        </Group>
      }
    >
      <Stack gap="lg">
        {/* Top metrics */}
        <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
          <StatCard
            label={t('dashboard.totalUsers')}
            value={formatNumber(stats?.totalUsers ?? 0)}
            icon={<IconUsers size={20} />}
            trend={12}
            hint={`${formatNumber(stats?.activeUsers ?? 0)} ${t('dashboard.activeUsers').toLowerCase()}`}
            accent="#7c5cff"
            delay={0}
            spark={<Sparkmini data={growth.map((g) => g.value)} color="#7c5cff" />}
          />
          <StatCard
            label={t('dashboard.onlineNow')}
            value={formatNumber(stats?.onlineUsers ?? 0)}
            icon={<IconWifi size={20} />}
            accent="#22ff7c"
            delay={0.05}
            hint={t('common.online')}
          />
          <StatCard
            label={t('dashboard.nodesOnline')}
            value={`${stats?.onlineNodes ?? 0}/${stats?.totalNodes ?? 0}`}
            icon={<IconServer2 size={20} />}
            accent="#22d3ee"
            delay={0.1}
            hint={t('status.operational')}
          />
          <StatCard
            label={t('dashboard.trafficMonth')}
            value={formatBytes(stats?.trafficMonthBytes ?? 0)}
            icon={<IconBolt size={20} />}
            trend={8}
            accent="#ffa121"
            delay={0.15}
            spark={<Sparkmini data={traffic.map((x) => x.value)} color="#ffa121" />}
          />
        </SimpleGrid>

        {/* Hero + growth */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <GlassCard glow="ghost" delay={0.18} h="100%" style={{ position: 'relative', overflow: 'hidden' }}>
              <Box
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(420px circle at 80% 0%, rgba(124,92,255,0.18), transparent 60%)',
                  pointerEvents: 'none',
                }}
              />
              <Stack align="center" gap="sm" py="sm">
                <Group gap="xs">
                  <StatusDot status={stats?.health ?? 'operational'} pulse />
                  <Text fz="sm" c="dimmed">
                    {stats?.health === 'operational'
                      ? t('dashboard.allOperational')
                      : stats?.health === 'degraded'
                        ? t('dashboard.degraded')
                        : t('dashboard.down')}
                  </Text>
                </Group>

                <Box style={{ position: 'relative' }}>
                  <RingProgress
                    size={188}
                    thickness={9}
                    roundCaps
                    sections={[{ value: spherePower, color: 'ghost.5' }]}
                    label={
                      <Stack align="center" gap={0}>
                        <Box style={{ animation: 'gs-pulse 2.4s infinite' }}>
                          <GhostSphereMark size={52} />
                        </Box>
                        <Text fz={30} fw={780} mt={6} style={{ fontFamily: 'var(--gs-font-display)' }}>
                          {spherePower}%
                        </Text>
                        <Text fz={11} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.1em' }}>
                          {t('dashboard.spherePower')}
                        </Text>
                      </Stack>
                    }
                  />
                </Box>

                <Stack gap="sm" w="100%" mt="xs">
                  <Meter
                    value={stats?.cpuPercent ?? 0}
                    label={t('dashboard.cpu')}
                    right={`${stats?.cpuPercent ?? 0}%`}
                    color="#22d3ee"
                  />
                  <Meter
                    value={stats?.ramPercent ?? 0}
                    label={t('dashboard.memory')}
                    right={`${formatBytes(stats?.ramUsedBytes ?? 0)} / ${formatBytes(stats?.ramTotalBytes ?? 0)}`}
                    color="#a288f1"
                  />
                  <Group justify="space-between" mt={2}>
                    <Text fz="xs" c="dimmed">
                      {t('dashboard.uptime')}
                    </Text>
                    <Text fz="xs" fw={600}>
                      {formatUptime(stats?.uptimeSeconds)}
                    </Text>
                  </Group>
                </Stack>
              </Stack>
            </GlassCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <GlassCard delay={0.22} h="100%">
              <Group justify="space-between" mb="md">
                <Box>
                  <Title order={3}>{t('dashboard.userGrowth')}</Title>
                  <Text fz="xs" c="dimmed">
                    {t('dashboard.totalUsers')} · {t('dashboard.activeUsers')}
                  </Text>
                </Box>
                <IconActivity size={20} color="var(--gs-ghost)" />
              </Group>
              {growth.length > 0 ? (
                <AreaChart
                  h={260}
                  data={growth}
                  dataKey="label"
                  withGradient
                  withDots={false}
                  curveType="natural"
                  strokeWidth={2.4}
                  gridAxis="y"
                  series={[
                    { name: 'value', color: 'ghost.5', label: t('dashboard.totalUsers') },
                    { name: 'value2', color: 'spectre.5', label: t('dashboard.activeUsers') },
                  ]}
                />
              ) : (
                <Text c="dimmed">{t('dashboard.noData')}</Text>
              )}
            </GlassCard>
          </Grid.Col>
        </Grid>

        {/* Node load + activity */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <GlassCard delay={0.26}>
              <Group justify="space-between" mb="md">
                <Title order={3}>{t('dashboard.topNodes')}</Title>
                <Button
                  variant="subtle"
                  size="compact-sm"
                  rightSection={<IconArrowRight size={14} />}
                  onClick={() => navigate('/nodes')}
                >
                  {t('nav.nodes')}
                </Button>
              </Group>
              {nodeLoad.length > 0 ? (
                <BarChart
                  h={260}
                  data={nodeLoad}
                  dataKey="name"
                  gridAxis="y"
                  withBarValueLabel
                  series={[{ name: 'traffic', color: 'spectre.5', label: 'TB' }]}
                />
              ) : (
                <Text c="dimmed">{t('dashboard.noData')}</Text>
              )}
            </GlassCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 5 }}>
            <GlassCard delay={0.3} h="100%">
              <Group justify="space-between" mb="md">
                <Title order={3}>{t('dashboard.recentActivity')}</Title>
              </Group>
              <Stack gap="xs">
                {activity.map((e) => (
                  <Group key={e.id} gap="sm" wrap="nowrap" align="flex-start">
                    <Box
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        marginTop: 6,
                        background: ACTIVITY_COLORS[e.level],
                        boxShadow: `0 0 8px ${ACTIVITY_COLORS[e.level]}`,
                        flexShrink: 0,
                      }}
                    />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fz="sm" lineClamp={2}>
                        {e.message}
                      </Text>
                      <Text fz="xs" c="dimmed">
                        {timeAgo(e.at, i18n.language)}
                      </Text>
                    </Box>
                  </Group>
                ))}
              </Stack>
            </GlassCard>
          </Grid.Col>
        </Grid>

        {/* Quick actions */}
        <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
          <QuickAction
            label={t('dashboard.addNode')}
            icon={<IconServer2 size={20} />}
            accent="#22d3ee"
            onClick={() => navigate('/nodes?create=1')}
          />
          <QuickAction
            label={t('dashboard.addUser')}
            icon={<IconUsers size={20} />}
            accent="#7c5cff"
            onClick={() => navigate('/users?create=1')}
          />
          <QuickAction
            label={t('dashboard.newConfig')}
            icon={<IconBolt size={20} />}
            accent="#22ff7c"
            onClick={() => navigate('/configs')}
          />
          <QuickAction
            label={t('dashboard.createBackup')}
            icon={<IconDatabaseExport size={20} />}
            accent="#ffa121"
            onClick={() => navigate('/backups?create=1')}
          />
        </SimpleGrid>
      </Stack>
    </Page>
  );
}

function Sparkmini({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  return (
    <Group gap={2} align="flex-end" h={26}>
      {data.slice(-16).map((v, i) => (
        <Box
          key={i}
          style={{
            width: 4,
            height: `${Math.max(10, (v / max) * 100)}%`,
            borderRadius: 2,
            background: `${color}`,
            opacity: 0.35 + (i / 16) * 0.65,
          }}
        />
      ))}
    </Group>
  );
}

function QuickAction({
  label,
  icon,
  accent,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  accent: string;
  onClick: () => void;
}) {
  return (
    <GlassCard interactive onClick={onClick} p="md">
      <Group justify="space-between">
        <Group gap="sm">
          <Box
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              background: `${accent}1a`,
              border: `1px solid ${accent}33`,
              color: accent,
            }}
          >
            {icon}
          </Box>
          <Text fw={600}>{label}</Text>
        </Group>
        <IconArrowRight size={18} color="var(--gs-text-dim)" />
      </Group>
    </GlassCard>
  );
}
