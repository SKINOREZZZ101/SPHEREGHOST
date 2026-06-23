import type { GsConfigProfile, GsNode, GsUser } from './dto';

// Defensive mappers — Remnawave shapes can vary across minor versions, so we
// read fields optionally and fall back to safe defaults.

type Raw = Record<string, any>;

function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(n) ? (n as number) : fallback;
}

export function mapNode(n: Raw): GsNode {
  const isConnected = !!n.isConnected;
  const isDisabled = !!n.isDisabled;
  const isConnecting = !!n.isConnecting;
  const system = n.system ?? {};
  const cpu = num(system.cpu?.usage ?? system.cpuUsage ?? n.cpuPercent);
  const memUsed = num(system.memory?.used ?? system.memUsed);
  const memTotal = num(system.memory?.total ?? system.memTotal, 1);
  return {
    uuid: String(n.uuid ?? ''),
    name: String(n.name ?? 'node'),
    address: String(n.address ?? ''),
    port: num(n.port, 2222),
    countryCode: String(n.countryCode ?? 'XX').toUpperCase(),
    status: isDisabled ? 'disabled' : isConnecting ? 'connecting' : isConnected ? 'connected' : 'disconnected',
    isConnected,
    isDisabled,
    isConnecting,
    xrayVersion: n.xrayVersion ?? null,
    nodeVersion: n.nodeVersion ?? null,
    usersOnline: num(n.usersOnline),
    xrayUptimeSeconds: Math.floor(num(n.xrayUptime) / (num(n.xrayUptime) > 1e6 ? 1000 : 1)),
    trafficUsedBytes: num(n.trafficUsedBytes),
    trafficLimitBytes: n.trafficLimitBytes != null ? num(n.trafficLimitBytes) : null,
    consumptionMultiplier: num(n.consumptionMultiplier, 1),
    cpuPercent: Math.round(cpu),
    ramPercent: memTotal ? Math.round((memUsed / memTotal) * 100) : 0,
    activeConfigProfileUuid: n.activeConfigProfileUuid ?? n.configProfile?.activeConfigProfileUuid ?? null,
    activeConfigProfileName: n.activeConfigProfileName ?? null,
    activeInbounds: Array.isArray(n.activeInbounds)
      ? n.activeInbounds.map((x: Raw) => (typeof x === 'string' ? x : x?.tag)).filter(Boolean)
      : [],
    tags: Array.isArray(n.tags) ? n.tags : [],
    viewPosition: num(n.viewPosition),
    lastStatusMessage: n.lastStatusMessage ?? null,
    lastStatusChange: n.lastStatusChange ?? null,
  };
}

export function mapUser(u: Raw): GsUser {
  const traffic = u.userTraffic ?? u.traffic ?? {};
  const used = num(u.usedTrafficBytes ?? traffic.usedTrafficBytes);
  return {
    uuid: String(u.uuid ?? ''),
    shortUuid: String(u.shortUuid ?? ''),
    username: String(u.username ?? ''),
    status: (u.status ?? 'ACTIVE') as GsUser['status'],
    usedTrafficBytes: used,
    trafficLimitBytes: num(u.trafficLimitBytes),
    trafficStrategy: (u.trafficLimitStrategy ?? u.trafficStrategy ?? 'NO_RESET') as GsUser['trafficStrategy'],
    expireAt: u.expireAt ?? null,
    isOnline: !!(traffic.onlineAt && Date.now() - new Date(traffic.onlineAt).getTime() < 90_000),
    onlineAt: traffic.onlineAt ?? u.onlineAt ?? null,
    squads: Array.isArray(u.activeInternalSquads)
      ? u.activeInternalSquads.map((s: Raw) => s?.name ?? s).filter(Boolean)
      : [],
    hwidDeviceLimit: u.hwidDeviceLimit != null ? num(u.hwidDeviceLimit) : null,
    hwidDevicesUsed: num(u.hwidDevicesUsed),
    telegramId: u.telegramId != null ? String(u.telegramId) : null,
    email: u.email ?? null,
    subscriptionUrl: String(u.subscriptionUrl ?? ''),
    createdAt: u.createdAt ?? new Date().toISOString(),
  };
}

export function mapConfigProfile(p: Raw): GsConfigProfile {
  const inbounds = Array.isArray(p.inbounds) ? p.inbounds : [];
  return {
    uuid: String(p.uuid ?? ''),
    name: String(p.name ?? 'profile'),
    inbounds: inbounds.map((ib: Raw) => ({
      uuid: String(ib.uuid ?? ib.tag ?? ''),
      tag: String(ib.tag ?? ''),
      protocol: String(ib.type ?? ib.protocol ?? 'vless'),
      port: num(ib.port),
      network: String(ib.network ?? 'tcp'),
      security: String(ib.security ?? 'none'),
    })),
    nodesUsing: num(p.nodesUsing ?? (Array.isArray(p.nodes) ? p.nodes.length : 0)),
    updatedAt: p.updatedAt ?? new Date().toISOString(),
    config: (p.config as Record<string, unknown>) ?? {},
  };
}
