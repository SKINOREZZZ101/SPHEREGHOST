import { Box, Grid, Group, List, Stack, Text, ThemeIcon, Title, UnstyledButton } from '@mantine/core';
import {
  IconBackspace,
  IconBraces,
  IconBulb,
  IconDatabaseExport,
  IconHelpCircle,
  IconLink,
  IconPlugConnected,
  IconPuzzle,
  IconServer2,
  IconSparkles,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { GUIDE, type GuideSection } from './content';

const ICONS: Record<string, Icon> = {
  sphere: IconSparkles,
  plug: IconPlugConnected,
  server: IconServer2,
  braces: IconBraces,
  users: IconUsers,
  link: IconLink,
  puzzle: IconPuzzle,
  backup: IconDatabaseExport,
  help: IconHelpCircle,
};

export default function GuidePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('ru') ? 'ru' : 'en';
  const sections = GUIDE[lang];

  const scrollTo = (id: string) => {
    document.getElementById(`guide-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Page title={t('guide.title')} subtitle={t('guide.subtitle')}>
      <Grid gutter="lg">
        {/* TOC */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Box style={{ position: 'sticky', top: 84 }}>
            <GlassCard p="sm">
              <Text fz="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb="xs" style={{ letterSpacing: '0.12em' }}>
                {t('guide.contents')}
              </Text>
              <Stack gap={2}>
                {sections.map((s) => {
                  const Icon = ICONS[s.icon] ?? IconBackspace;
                  return (
                    <UnstyledButton
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        borderRadius: 10,
                        color: 'var(--gs-text)',
                      }}
                      className="gs-nav-item"
                    >
                      <Icon size={16} color="var(--gs-ghost)" stroke={1.8} />
                      <Text fz="sm">{s.title}</Text>
                    </UnstyledButton>
                  );
                })}
              </Stack>
            </GlassCard>
          </Box>
        </Grid.Col>

        {/* Content */}
        <Grid.Col span={{ base: 12, md: 9 }}>
          <Stack gap="lg">
            {sections.map((section, i) => (
              <SectionCard key={section.id} section={section} delay={i * 0.05} />
            ))}
          </Stack>
        </Grid.Col>
      </Grid>
    </Page>
  );
}

function SectionCard({ section, delay }: { section: GuideSection; delay: number }) {
  const Icon = ICONS[section.icon] ?? IconBackspace;
  return (
    <Box id={`guide-${section.id}`} style={{ scrollMarginTop: 84 }}>
      <GlassCard delay={delay}>
        <Group gap="sm" mb="md">
          <ThemeIcon size={42} radius="md" variant="light" color="ghost">
            <Icon size={22} stroke={1.8} />
          </ThemeIcon>
          <Title order={2} fz="xl">
            {section.title}
          </Title>
        </Group>
        <Stack gap="md">
          {section.blocks.map((block, idx) => {
            if (block.type === 'p') {
              return (
                <Text key={idx} c="dimmed" style={{ lineHeight: 1.7 }}>
                  {block.text}
                </Text>
              );
            }
            if (block.type === 'steps') {
              return (
                <List
                  key={idx}
                  type="ordered"
                  spacing="sm"
                  styles={{
                    item: { color: 'var(--gs-text)' },
                  }}
                >
                  {block.items.map((it, k) => (
                    <List.Item key={k}>{it}</List.Item>
                  ))}
                </List>
              );
            }
            if (block.type === 'tip') {
              return (
                <Group
                  key={idx}
                  gap="sm"
                  wrap="nowrap"
                  align="flex-start"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'rgba(34,211,238,0.08)',
                    border: '1px solid rgba(34,211,238,0.25)',
                  }}
                >
                  <IconBulb size={20} color="var(--gs-spectre)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <Text fz="sm">{block.text}</Text>
                </Group>
              );
            }
            return (
              <Box
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid var(--gs-border)',
                  fontFamily: 'var(--gs-font-mono)',
                  fontSize: 13,
                  color: 'var(--gs-spectre)',
                }}
              >
                {block.text}
              </Box>
            );
          })}
        </Stack>
      </GlassCard>
    </Box>
  );
}
