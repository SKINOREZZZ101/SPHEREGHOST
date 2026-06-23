import {
  IconLayoutDashboard,
  IconServer2,
  IconBraces,
  IconPlugConnected,
  IconUsers,
  IconLink,
  IconUsersGroup,
  IconKey,
  IconPuzzle,
  IconDatabaseExport,
  IconBuildingWarehouse,
  IconSettings,
  IconBook2,
  type Icon,
} from '@tabler/icons-react';

export interface NavItem {
  path: string;
  labelKey: string;
  icon: Icon;
  accent: string;
}

export interface NavGroup {
  titleKey: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    titleKey: 'nav.groupOverview',
    items: [{ path: '/', labelKey: 'nav.dashboard', icon: IconLayoutDashboard, accent: '#7c5cff' }],
  },
  {
    titleKey: 'nav.groupInfra',
    items: [
      { path: '/nodes', labelKey: 'nav.nodes', icon: IconServer2, accent: '#22d3ee' },
      { path: '/configs', labelKey: 'nav.configs', icon: IconBraces, accent: '#a288f1' },
      { path: '/hosts', labelKey: 'nav.hosts', icon: IconPlugConnected, accent: '#22ff7c' },
    ],
  },
  {
    titleKey: 'nav.groupAccess',
    items: [
      { path: '/users', labelKey: 'nav.users', icon: IconUsers, accent: '#7c5cff' },
      { path: '/subscriptions', labelKey: 'nav.subscriptions', icon: IconLink, accent: '#22d3ee' },
      { path: '/squads', labelKey: 'nav.squads', icon: IconUsersGroup, accent: '#f129b3' },
      { path: '/keys', labelKey: 'nav.keys', icon: IconKey, accent: '#ffa121' },
    ],
  },
  {
    titleKey: 'nav.groupGrowth',
    items: [
      { path: '/integrations', labelKey: 'nav.integrations', icon: IconPuzzle, accent: '#22ff7c' },
      { path: '/backups', labelKey: 'nav.backups', icon: IconDatabaseExport, accent: '#22d3ee' },
      { path: '/storage', labelKey: 'nav.storage', icon: IconBuildingWarehouse, accent: '#a288f1' },
    ],
  },
  {
    titleKey: 'nav.groupSystem',
    items: [
      { path: '/settings', labelKey: 'nav.settings', icon: IconSettings, accent: '#7c5cff' },
      { path: '/guide', labelKey: 'nav.guide', icon: IconBook2, accent: '#22d3ee' },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV.flatMap((g) => g.items);
