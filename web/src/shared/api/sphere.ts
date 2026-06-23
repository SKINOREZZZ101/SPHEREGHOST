// The Sphere service — a single facade the UI uses for all data.
// It transparently serves the in-memory demo dataset in demo mode, or
// proxies through the Ghost Sphere Core gateway in live mode.
import { http, demoDelay } from './client';
import { genId } from '@shared/lib/id';
import { isDemo } from '@entities/session/session.store';
import * as demo from './demo';
import type {
  ActivityEvent,
  GsApiToken,
  GsBackup,
  GsConfigProfile,
  GsHost,
  GsIntegration,
  GsNode,
  GsSnippet,
  GsSquad,
  GsSubscriptionTemplate,
  GsTemplate,
  GsUser,
  NodeLoadPoint,
  SeriesPoint,
  SphereStats,
} from './types';

// ---- demo store (stable within a session) ----
interface DemoStore {
  nodes: GsNode[];
  profiles: GsConfigProfile[];
  snippets: GsSnippet[];
  hosts: GsHost[];
  users: GsUser[];
  squads: GsSquad[];
  tokens: GsApiToken[];
  subTemplates: GsSubscriptionTemplate[];
  integrations: GsIntegration[];
  backups: GsBackup[];
  templates: GsTemplate[];
}

let store: DemoStore | null = null;
function db(): DemoStore {
  if (!store) {
    const nodes = demo.demoNodes();
    const users = demo.demoUsers();
    store = {
      nodes,
      users,
      profiles: demo.demoConfigProfiles(),
      snippets: demo.demoSnippets(),
      hosts: demo.demoHosts(),
      squads: demo.demoSquads(),
      tokens: demo.demoTokens(),
      subTemplates: demo.demoSubTemplates(),
      integrations: demo.demoIntegrations(),
      backups: demo.demoBackups(),
      templates: demo.demoTemplates(),
    };
  }
  return store;
}

async function get<T>(url: string, demoValue: () => T): Promise<T> {
  if (isDemo()) {
    await demoDelay();
    return demoValue();
  }
  const { data } = await http.get<T>(url);
  return data;
}

async function mutate<T>(fn: () => Promise<T> | T, live: () => Promise<T>): Promise<T> {
  if (isDemo()) {
    await demoDelay();
    return fn();
  }
  return live();
}

export const SphereApi = {
  // ---------- dashboard ----------
  stats: () => get<SphereStats>('/system/stats', () => demo.demoStats(db().nodes, db().users)),
  activity: () => get<ActivityEvent[]>('/system/activity', () => demo.demoActivity()),
  userGrowth: () => get<SeriesPoint[]>('/system/stats/user-growth', () => demo.demoUserGrowth()),
  trafficSeries: () => get<SeriesPoint[]>('/system/stats/traffic', () => demo.demoTrafficSeries()),
  nodeLoad: () => get<NodeLoadPoint[]>('/system/stats/node-load', () => demo.demoNodeLoad(db().nodes)),

  // ---------- nodes ----------
  nodes: () => get<GsNode[]>('/nodes', () => db().nodes),
  nodeAction: (uuid: string, action: 'enable' | 'disable' | 'restart' | 'reset-traffic' | 'delete') =>
    mutate(
      () => {
        const d = db();
        if (action === 'delete') {
          d.nodes = d.nodes.filter((n) => n.uuid !== uuid);
          return { ok: true };
        }
        const node = d.nodes.find((n) => n.uuid === uuid);
        if (node) {
          if (action === 'enable') {
            node.isDisabled = false;
            node.isConnected = true;
            node.status = 'connected';
          }
          if (action === 'disable') {
            node.isDisabled = true;
            node.isConnected = false;
            node.status = 'disabled';
          }
          if (action === 'reset-traffic') node.trafficUsedBytes = 0;
        }
        return { ok: true };
      },
      async () => {
        const path = action === 'delete' ? `/nodes/${uuid}` : `/nodes/${uuid}/actions/${action}`;
        if (action === 'delete') await http.delete(path);
        else await http.post(path);
        return { ok: true };
      },
    ),
  createNode: (payload: Partial<GsNode>) =>
    mutate(
      () => {
        const node: GsNode = {
          uuid: genId(),
          name: payload.name ?? 'New Node',
          address: payload.address ?? '0.0.0.0',
          port: payload.port ?? 2222,
          countryCode: payload.countryCode ?? 'XX',
          status: 'connecting',
          isConnected: false,
          isDisabled: false,
          isConnecting: true,
          xrayVersion: null,
          nodeVersion: null,
          usersOnline: 0,
          xrayUptimeSeconds: 0,
          trafficUsedBytes: 0,
          trafficLimitBytes: payload.trafficLimitBytes ?? null,
          consumptionMultiplier: payload.consumptionMultiplier ?? 1,
          cpuPercent: 0,
          ramPercent: 0,
          activeConfigProfileUuid: payload.activeConfigProfileUuid ?? null,
          activeConfigProfileName: null,
          activeInbounds: payload.activeInbounds ?? [],
          tags: payload.tags ?? [],
          viewPosition: db().nodes.length,
          lastStatusMessage: 'Handshaking…',
          lastStatusChange: new Date().toISOString(),
        };
        db().nodes.push(node);
        return node;
      },
      async () => (await http.post<GsNode>('/nodes', payload)).data,
    ),

  // ---------- configs ----------
  profiles: () => get<GsConfigProfile[]>('/config-profiles', () => db().profiles),
  profile: (uuid: string) =>
    get<GsConfigProfile | undefined>(`/config-profiles/${uuid}`, () =>
      db().profiles.find((p) => p.uuid === uuid),
    ),
  saveProfile: (uuid: string, config: Record<string, unknown>) =>
    mutate(
      () => {
        const p = db().profiles.find((x) => x.uuid === uuid);
        if (p) {
          p.config = config;
          p.updatedAt = new Date().toISOString();
        }
        return { ok: true };
      },
      async () => {
        await http.patch('/config-profiles', { uuid, config });
        return { ok: true };
      },
    ),
  snippets: () => get<GsSnippet[]>('/snippets', () => db().snippets),

  // ---------- hosts ----------
  hosts: () => get<GsHost[]>('/hosts', () => db().hosts),

  // ---------- users ----------
  users: () => get<GsUser[]>('/users', () => db().users),
  userAction: (uuid: string, action: 'enable' | 'disable' | 'reset-traffic' | 'revoke') =>
    mutate(
      () => {
        const u = db().users.find((x) => x.uuid === uuid);
        if (u) {
          if (action === 'enable') u.status = 'ACTIVE';
          if (action === 'disable') u.status = 'DISABLED';
          if (action === 'reset-traffic') u.usedTrafficBytes = 0;
          if (action === 'revoke') u.shortUuid = Math.random().toString(36).slice(2, 18);
        }
        return { ok: true };
      },
      async () => {
        await http.post(`/users/${uuid}/actions/${action}`);
        return { ok: true };
      },
    ),
  createUser: (payload: Partial<GsUser>) =>
    mutate(
      () => {
        const short = Math.random().toString(36).slice(2, 18);
        const u: GsUser = {
          uuid: genId(),
          shortUuid: short,
          username: payload.username ?? `user_${Math.random().toString(36).slice(2, 7)}`,
          status: 'ACTIVE',
          usedTrafficBytes: 0,
          trafficLimitBytes: payload.trafficLimitBytes ?? 100 * 1024 ** 3,
          trafficStrategy: payload.trafficStrategy ?? 'MONTH',
          expireAt: payload.expireAt ?? new Date(Date.now() + 30 * 86400000).toISOString(),
          isOnline: false,
          onlineAt: null,
          squads: payload.squads ?? ['Standard'],
          hwidDeviceLimit: payload.hwidDeviceLimit ?? 3,
          hwidDevicesUsed: 0,
          telegramId: payload.telegramId ?? null,
          email: payload.email ?? null,
          subscriptionUrl: `https://sub.ghost-sphere.app/${short}`,
          createdAt: new Date().toISOString(),
        };
        db().users.unshift(u);
        return u;
      },
      async () => (await http.post<GsUser>('/users', payload)).data,
    ),

  // ---------- squads / tokens / subs ----------
  squads: () => get<GsSquad[]>('/squads', () => db().squads),
  tokens: () => get<GsApiToken[]>('/keys/tokens', () => db().tokens),
  subTemplates: () => get<GsSubscriptionTemplate[]>('/subscriptions/templates', () => db().subTemplates),

  // ---------- integrations ----------
  integrations: () => get<GsIntegration[]>('/integrations', () => db().integrations),
  toggleIntegration: (id: string) =>
    mutate(
      () => {
        const it = db().integrations.find((x) => x.id === id);
        if (it) {
          it.status = it.status === 'connected' ? 'disconnected' : 'connected';
          it.healthy = it.status === 'connected';
        }
        return { ok: true };
      },
      async () => {
        await http.post(`/integrations/${id}/toggle`);
        return { ok: true };
      },
    ),

  // ---------- backups / storage ----------
  backups: () => get<GsBackup[]>('/backups', () => db().backups),
  createBackup: (payload: Partial<GsBackup>) =>
    mutate(
      () => {
        const b: GsBackup = {
          id: genId(),
          createdAt: new Date().toISOString(),
          sizeBytes: Math.floor((40 + Math.random() * 200) * 1024 * 1024),
          destination: payload.destination ?? 'local',
          includesDb: payload.includesDb ?? true,
          includesPanel: payload.includesPanel ?? true,
          includesBots: payload.includesBots ?? false,
          status: 'success',
        };
        db().backups.unshift(b);
        return b;
      },
      async () => (await http.post<GsBackup>('/backups', payload)).data,
    ),
  templates: () => get<GsTemplate[]>('/storage/templates', () => db().templates),

  // ---------- keygen / tools ----------
  generateX25519: () =>
    mutate(
      () => ({
        privateKey: randB64(43),
        publicKey: randB64(43),
      }),
      async () => (await http.get<{ privateKey: string; publicKey: string }>('/system/tools/x25519')).data,
    ),
  createToken: (name: string) =>
    mutate(
      () => {
        const token = `eyJhbGciOiJIUzI1Ni${randB64(120)}`;
        db().tokens.unshift({ uuid: genId(), name, tokenPreview: `${token.slice(0, 10)}…${token.slice(-4)}`, createdAt: new Date().toISOString() });
        return { token };
      },
      async () => (await http.post<{ token: string }>('/keys/tokens', { name })).data,
    ),
};

function randB64(len: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export type { DemoStore };
