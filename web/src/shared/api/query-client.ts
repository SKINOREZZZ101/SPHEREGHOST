import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 8_000,
      gcTime: 5 * 60_000,
    },
  },
});

export const qk = {
  stats: ['stats'] as const,
  activity: ['activity'] as const,
  userGrowth: ['user-growth'] as const,
  trafficSeries: ['traffic-series'] as const,
  nodeLoad: ['node-load'] as const,
  nodes: ['nodes'] as const,
  profiles: ['profiles'] as const,
  profile: (uuid: string) => ['profile', uuid] as const,
  snippets: ['snippets'] as const,
  hosts: ['hosts'] as const,
  users: ['users'] as const,
  squads: ['squads'] as const,
  tokens: ['tokens'] as const,
  subTemplates: ['sub-templates'] as const,
  integrations: ['integrations'] as const,
  backups: ['backups'] as const,
  templates: ['templates'] as const,
};
