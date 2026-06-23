import { useEffect, useRef, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Grid,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import Editor, { type OnMount } from '@monaco-editor/react';
import {
  IconArrowLeft,
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconDeviceFloppy,
  IconKey,
  IconRosetteDiscountCheck,
  IconWand,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { Page } from '@shared/ui/Page';
import { GlassCard } from '@shared/ui/GlassCard';
import { LoadingScreen } from '@shared/ui/LoadingScreen';
import { useProfile, useSaveProfile } from '@shared/api/hooks';
import { SphereApi } from '@shared/api/sphere';
import { XRAY_SCHEMA, validateXray, type ValidationIssue } from '@shared/xray/schema';

export default function ConfigEditorPage() {
  const { uuid = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile(uuid);
  const save = useSaveProfile();

  const [value, setValue] = useState('');
  const [dirty, setDirty] = useState(false);
  const [issues, setIssues] = useState<ValidationIssue[] | null>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  useEffect(() => {
    if (profile) setValue(JSON.stringify(profile.config, null, 2));
  }, [profile]);

  const handleMount: OnMount = (ed, monaco) => {
    editorRef.current = ed;
    monaco.editor.defineTheme('ghost-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'string.key.json', foreground: 'a288f1' },
        { token: 'string.value.json', foreground: '22d3ee' },
        { token: 'number', foreground: '22ff7c' },
        { token: 'keyword.json', foreground: 'ff9a10' },
      ],
      colors: {
        'editor.background': '#0b0c12',
        'editor.foreground': '#c7c8d6',
        'editorLineNumber.foreground': '#3a3d52',
        'editorLineNumber.activeForeground': '#7c5cff',
        'editor.selectionBackground': '#7c5cff44',
        'editor.lineHighlightBackground': '#ffffff08',
        'editorCursor.foreground': '#22d3ee',
        'editorIndentGuide.background1': '#ffffff0c',
      },
    });
    monaco.editor.setTheme('ghost-dark');
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [{ uri: 'inmemory://ghost/xray.schema.json', fileMatch: ['*'], schema: XRAY_SCHEMA }],
    });
  };

  const runValidate = () => {
    const result = validateXray(value);
    setIssues(result.issues);
    notifications.show({
      message: result.ok ? t('configs.valid') : t('configs.invalid'),
      color: result.ok ? 'teal' : 'red',
    });
  };

  const format = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(value), null, 2);
      setValue(formatted);
      notifications.show({ message: t('configs.formatJson'), color: 'teal' });
    } catch {
      notifications.show({ message: 'JSON error', color: 'red' });
    }
  };

  const doSave = () => {
    try {
      const parsed = JSON.parse(value);
      save.mutate(
        { uuid, config: parsed },
        {
          onSuccess: () => {
            setDirty(false);
            notifications.show({ message: t('configs.profileSaved'), color: 'teal' });
          },
        },
      );
    } catch {
      notifications.show({ message: 'JSON error', color: 'red' });
    }
  };

  const insertReality = async () => {
    const keys = await SphereApi.generateX25519();
    notifications.show({
      title: t('configs.x25519'),
      message: `private: ${keys.privateKey.slice(0, 16)}… · public: ${keys.publicKey.slice(0, 16)}…`,
      color: 'grape',
    });
  };

  if (isLoading) return <LoadingScreen />;
  if (!profile) {
    return (
      <Page title={t('errors.notFound')}>
        <Button leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/configs')}>
          {t('common.back')}
        </Button>
      </Page>
    );
  }

  const errorCount = issues?.filter((i) => i.level === 'error').length ?? 0;

  return (
    <Page
      title={
        <Group gap="sm">
          <ActionIcon variant="subtle" onClick={() => navigate('/configs')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          {profile.name}
        </Group>
      }
      subtitle={`${profile.inbounds.length} ${t('configs.inboundsCount').toLowerCase()} · ${profile.nodesUsing} ${t('configs.nodesUsing').toLowerCase()}`}
      actions={
        <Group gap="xs">
          {dirty && (
            <Badge color="ember" variant="light">
              {t('configs.unsaved')}
            </Badge>
          )}
          <Tooltip label={t('configs.realityKeygen')}>
            <Button variant="default" leftSection={<IconKey size={16} />} onClick={insertReality}>
              {t('configs.x25519')}
            </Button>
          </Tooltip>
          <Button variant="default" leftSection={<IconWand size={16} />} onClick={format}>
            {t('configs.formatJson')}
          </Button>
          <Button variant="default" leftSection={<IconRosetteDiscountCheck size={16} />} onClick={runValidate}>
            {t('configs.validate')}
          </Button>
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={doSave}
            loading={save.isPending}
            variant="gradient"
            gradient={{ from: 'ghost.6', to: 'spectre.5', deg: 135 }}
          >
            {t('common.save')}
          </Button>
        </Group>
      }
    >
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, lg: issues ? 8 : 12 }}>
          <GlassCard p={4} style={{ overflow: 'hidden' }}>
            <Box style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--gs-border)' }}>
              <Editor
                height="calc(100vh - 240px)"
                defaultLanguage="json"
                value={value}
                onMount={handleMount}
                onChange={(v) => {
                  setValue(v ?? '');
                  setDirty(true);
                }}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  padding: { top: 14, bottom: 14 },
                  tabSize: 2,
                  renderLineHighlight: 'all',
                  lineNumbersMinChars: 3,
                }}
              />
            </Box>
          </GlassCard>
        </Grid.Col>

        {issues && (
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <GlassCard h="100%">
              <Group justify="space-between" mb="md">
                <Title order={4} fz="md">
                  {t('configs.schemaValidation')}
                </Title>
                <Badge color={errorCount ? 'red' : 'toxic'} variant="light">
                  {errorCount ? t('configs.errorsFound', { count: errorCount }) : t('configs.noErrors')}
                </Badge>
              </Group>
              <ScrollArea style={{ maxHeight: 'calc(100vh - 320px)' }}>
                <Stack gap="xs">
                  {issues.length === 0 ? (
                    <Group gap="sm" c="toxic.4">
                      <IconCircleCheck size={20} />
                      <Text fz="sm">{t('configs.valid')}</Text>
                    </Group>
                  ) : (
                    issues.map((issue, i) => (
                      <Group key={i} gap="sm" align="flex-start" wrap="nowrap">
                        {issue.level === 'error' ? (
                          <IconCircleX size={18} color="#ff4d6d" style={{ marginTop: 2, flexShrink: 0 }} />
                        ) : (
                          <IconCheck size={18} color="#ffa121" style={{ marginTop: 2, flexShrink: 0 }} />
                        )}
                        <Text fz="sm" c={issue.level === 'error' ? 'red.4' : 'ember.4'}>
                          {issue.message}
                        </Text>
                      </Group>
                    ))
                  )}
                </Stack>
              </ScrollArea>
            </GlassCard>
          </Grid.Col>
        )}
      </Grid>
    </Page>
  );
}
