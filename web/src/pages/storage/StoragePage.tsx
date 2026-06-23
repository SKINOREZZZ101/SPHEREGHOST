import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconBuildingWarehouse,
  IconDownload,
  IconFileImport,
  IconPackage,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { useTemplates } from '@shared/api/hooks';
import type { GsTemplate, TemplateKind } from '@shared/api/types';

const KIND_META: Record<TemplateKind, { label: string; color: string }> = {
  XRAY_JSON: { label: 'Xray', color: '#7c5cff' },
  SUBSCRIPTION: { label: 'Sub', color: '#22d3ee' },
  SUBPAGE: { label: 'Page', color: '#22ff7c' },
  SRR: { label: 'SRR', color: '#ffa121' },
  NODE_PLUGIN: { label: 'Plugin', color: '#f129b3' },
};

export default function StoragePage() {
  const { t } = useTranslation();
  const { data: templates = [] } = useTemplates();
  const [kind, setKind] = useState<string>('all');

  const filtered = useMemo(
    () => (kind === 'all' ? templates : templates.filter((x) => x.kind === kind)),
    [templates, kind],
  );

  return (
    <Page
      title={t('storage.title')}
      subtitle={t('storage.subtitle')}
      icon={<IconBuildingWarehouse size={24} />}
      actions={
        <Button variant="default" leftSection={<IconFileImport size={16} />}>
          {t('storage.importFromGithub')}
        </Button>
      }
    >
      <Stack gap="lg">
        <SegmentedControl
          value={kind}
          onChange={setKind}
          data={[
            { value: 'all', label: t('common.all') },
            { value: 'XRAY_JSON', label: t('storage.xrayCore') },
            { value: 'SUBSCRIPTION', label: t('storage.subTemplates') },
            { value: 'SUBPAGE', label: t('storage.subPages') },
            { value: 'SRR', label: t('storage.srr') },
            { value: 'NODE_PLUGIN', label: t('storage.nodePlugins') },
          ]}
          size="sm"
          style={{ alignSelf: 'flex-start', flexWrap: 'wrap' }}
        />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {filtered.map((tpl, i) => (
            <TemplateCard key={tpl.id} template={tpl} delay={i * 0.04} />
          ))}
        </SimpleGrid>
      </Stack>
    </Page>
  );
}

function TemplateCard({ template, delay }: { template: GsTemplate; delay: number }) {
  const { t } = useTranslation();
  const meta = KIND_META[template.kind];
  return (
    <GlassCard delay={delay} interactive>
      <Group justify="space-between" align="flex-start">
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            background: `${meta.color}1a`,
            border: `1px solid ${meta.color}33`,
            color: meta.color,
          }}
        >
          <IconPackage size={22} />
        </Box>
        <Badge variant="light" radius="sm" style={{ background: `${meta.color}1f`, color: meta.color }}>
          {meta.label}
        </Badge>
      </Group>

      <Text fw={680} mt="md">
        {template.name}
      </Text>
      <Text fz="sm" c="dimmed" mt={4} lineClamp={2} style={{ minHeight: 40 }}>
        {template.description}
      </Text>

      <Group justify="space-between" mt="md">
        <Text fz="xs" c="dimmed">
          {t('storage.author')}: {template.author}
        </Text>
      </Group>

      <Button
        fullWidth
        mt="md"
        variant="default"
        leftSection={<IconDownload size={16} />}
        onClick={() => notifications.show({ message: t('storage.installTemplate'), color: 'teal' })}
      >
        {t('storage.apply')}
      </Button>
    </GlassCard>
  );
}
