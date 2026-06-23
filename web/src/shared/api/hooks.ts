import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SphereApi, type NodeUpdatePayload } from './sphere';
import { qk, queryClient } from './query-client';
import { useSettings } from '@entities/settings/settings.store';

function usePoll() {
  return useSettings((s) => s.pollIntervalSec) * 1000;
}

export function useStats() {
  const poll = usePoll();
  return useQuery({ queryKey: qk.stats, queryFn: SphereApi.stats, refetchInterval: poll });
}
export const useActivity = () => useQuery({ queryKey: qk.activity, queryFn: SphereApi.activity });
export const useUserGrowth = () => useQuery({ queryKey: qk.userGrowth, queryFn: SphereApi.userGrowth });
export const useTrafficSeries = () =>
  useQuery({ queryKey: qk.trafficSeries, queryFn: SphereApi.trafficSeries });
export function useNodeLoad() {
  const poll = usePoll();
  return useQuery({ queryKey: qk.nodeLoad, queryFn: SphereApi.nodeLoad, refetchInterval: poll });
}

export function useNodes() {
  const poll = usePoll();
  return useQuery({ queryKey: qk.nodes, queryFn: SphereApi.nodes, refetchInterval: poll });
}

export function useNode(uuid: string | null) {
  const poll = usePoll();
  return useQuery({
    queryKey: qk.node(uuid ?? ''),
    queryFn: () => SphereApi.node(uuid as string),
    enabled: !!uuid,
    refetchInterval: poll,
  });
}

export function useUpdateNode() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: NodeUpdatePayload) => SphereApi.updateNode(payload),
    onSuccess: (_d, vars) => {
      client.invalidateQueries({ queryKey: qk.nodes });
      client.invalidateQueries({ queryKey: qk.node(vars.uuid) });
    },
  });
}

export const useProfiles = () => useQuery({ queryKey: qk.profiles, queryFn: SphereApi.profiles });
export const useProfile = (uuid: string) =>
  useQuery({ queryKey: qk.profile(uuid), queryFn: () => SphereApi.profile(uuid), enabled: !!uuid });
export const useSnippets = () => useQuery({ queryKey: qk.snippets, queryFn: SphereApi.snippets });
export const useHosts = () => useQuery({ queryKey: qk.hosts, queryFn: SphereApi.hosts });
export const useUsers = () => useQuery({ queryKey: qk.users, queryFn: SphereApi.users });
export const useSquads = () => useQuery({ queryKey: qk.squads, queryFn: SphereApi.squads });
export const useTokens = () => useQuery({ queryKey: qk.tokens, queryFn: SphereApi.tokens });
export const useSubTemplates = () =>
  useQuery({ queryKey: qk.subTemplates, queryFn: SphereApi.subTemplates });
export const useIntegrations = () =>
  useQuery({ queryKey: qk.integrations, queryFn: SphereApi.integrations });
export const useBackups = () => useQuery({ queryKey: qk.backups, queryFn: SphereApi.backups });
export const useTemplates = () => useQuery({ queryKey: qk.templates, queryFn: SphereApi.templates });

// ---- mutations ----
export function useNodeAction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, action }: { uuid: string; action: Parameters<typeof SphereApi.nodeAction>[1] }) =>
      SphereApi.nodeAction(uuid, action),
    onSuccess: () => client.invalidateQueries({ queryKey: qk.nodes }),
  });
}

export function useCreateNode() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: SphereApi.createNode,
    onSuccess: () => client.invalidateQueries({ queryKey: qk.nodes }),
  });
}

export function useUserAction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, action }: { uuid: string; action: Parameters<typeof SphereApi.userAction>[1] }) =>
      SphereApi.userAction(uuid, action),
    onSuccess: () => client.invalidateQueries({ queryKey: qk.users }),
  });
}

export function useCreateUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: SphereApi.createUser,
    onSuccess: () => client.invalidateQueries({ queryKey: qk.users }),
  });
}

export function useToggleIntegration() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: SphereApi.toggleIntegration,
    onSuccess: () => client.invalidateQueries({ queryKey: qk.integrations }),
  });
}

export function useCreateBackup() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: SphereApi.createBackup,
    onSuccess: () => client.invalidateQueries({ queryKey: qk.backups }),
  });
}

export function useSaveProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, config }: { uuid: string; config: Record<string, unknown> }) =>
      SphereApi.saveProfile(uuid, config),
    onSuccess: (_d, vars) => {
      client.invalidateQueries({ queryKey: qk.profile(vars.uuid) });
      client.invalidateQueries({ queryKey: qk.profiles });
    },
  });
}

export { queryClient };
