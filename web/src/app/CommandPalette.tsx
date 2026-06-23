import { Spotlight, type SpotlightActionData } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ALL_NAV_ITEMS } from './navigation';
import i18n from '@shared/i18n/i18n';

export function CommandPalette() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const actions: SpotlightActionData[] = useMemo(() => {
    const nav: SpotlightActionData[] = ALL_NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      return {
        id: `nav-${item.path}`,
        label: t(item.labelKey),
        description: t('nav.groupOverview'),
        onClick: () => navigate(item.path),
        leftSection: <Icon size={18} color={item.accent} stroke={1.8} />,
      };
    });

    const quick: SpotlightActionData[] = [
      {
        id: 'qa-add-node',
        label: t('dashboard.addNode'),
        onClick: () => navigate('/nodes?create=1'),
      },
      {
        id: 'qa-add-user',
        label: t('dashboard.addUser'),
        onClick: () => navigate('/users?create=1'),
      },
      {
        id: 'qa-backup',
        label: t('dashboard.createBackup'),
        onClick: () => navigate('/backups?create=1'),
      },
      {
        id: 'qa-lang',
        label: `${t('common.language')}: RU / EN`,
        onClick: () => void i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru'),
      },
    ];

    return [...nav, ...quick];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n.language]);

  return (
    <Spotlight
      actions={actions}
      nothingFound={t('common.empty')}
      highlightQuery
      shortcut={['mod + K', 'mod + P']}
      radius="lg"
      searchProps={{
        leftSection: <IconSearch size={18} stroke={1.8} />,
        placeholder: t('common.searchPlaceholder'),
      }}
    />
  );
}
