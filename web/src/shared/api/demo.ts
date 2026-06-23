// Rich, deterministic demo dataset so Ghost Sphere is fully explorable
// without a live Remnawave panel. Numbers are randomized per-load for life.
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

const GB = 1024 ** 3;
const TB = 1024 ** 4;

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}
function uuid(): string {
  return crypto.randomUUID();
}
function isoAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const GB_XRAY = '25.9.11';

const NODE_SEED = [
  { name: 'Frankfurt Core', cc: 'DE', addr: '49.12.x.x' },
  { name: 'Amsterdam Edge', cc: 'NL', addr: '188.34.x.x' },
  { name: 'Helsinki North', cc: 'FI', addr: '95.216.x.x' },
  { name: 'Warsaw Relay', cc: 'PL', addr: '146.59.x.x' },
  { name: 'Tokyo Pacific', cc: 'JP', addr: '160.16.x.x' },
  { name: 'Singapore Gate', cc: 'SG', addr: '139.180.x.x' },
  { name: 'New York Hub', cc: 'US', addr: '23.94.x.x' },
  { name: 'London Bridge', cc: 'GB', addr: '51.89.x.x' },
];

export function demoNodes(): GsNode[] {
  return NODE_SEED.map((seed, i) => {
    const disabled = i === 6;
    const connecting = i === 5;
    const connected = !disabled && !connecting;
    const limit = i % 3 === 0 ? 50 * TB : null;
    return {
      uuid: `demo-node-${i}`,
      name: seed.name,
      address: seed.addr,
      port: 2222,
      countryCode: seed.cc,
      status: disabled ? 'disabled' : connecting ? 'connecting' : 'connected',
      isConnected: connected,
      isDisabled: disabled,
      isConnecting: connecting,
      xrayVersion: connected ? GB_XRAY : null,
      nodeVersion: connected ? '2.7.0' : null,
      usersOnline: connected ? rand(40, 920) : 0,
      xrayUptimeSeconds: connected ? rand(3600, 60 * 86400) : 0,
      trafficUsedBytes: rand(2, 48) * TB,
      trafficLimitBytes: limit,
      consumptionMultiplier: pick([1, 1, 1, 1.5, 2]),
      cpuPercent: connected ? rand(6, 74) : 0,
      ramPercent: connected ? rand(18, 82) : 0,
      activeConfigProfileUuid: 'demo-profile-0',
      activeConfigProfileName: i % 2 === 0 ? 'Reality Prime' : 'Vision Stealth',
      activeInbounds: ['VLESS_REALITY', 'VLESS_VISION'],
      tags: i % 2 === 0 ? ['premium', 'eu'] : ['standard'],
      viewPosition: i,
      lastStatusMessage: disabled ? 'Disabled by operator' : connected ? 'Online' : 'Handshaking…',
      lastStatusChange: isoAgo(rand(1, 4000)),
    };
  });
}

const DEMO_XRAY_CONFIG = {
  log: { loglevel: 'warning' },
  inbounds: [
    {
      tag: 'VLESS_REALITY',
      listen: '0.0.0.0',
      port: 443,
      protocol: 'vless',
      settings: { clients: [], decryption: 'none' },
      streamSettings: {
        network: 'tcp',
        security: 'reality',
        realitySettings: {
          show: false,
          dest: 'www.cloudflare.com:443',
          serverNames: ['www.cloudflare.com'],
          privateKey: 'PRIVATE_KEY_PLACEHOLDER',
          shortIds: [''],
        },
      },
      sniffing: { enabled: true, destOverride: ['http', 'tls', 'quic'] },
    },
    {
      tag: 'VLESS_VISION',
      listen: '0.0.0.0',
      port: 8443,
      protocol: 'vless',
      settings: { clients: [], decryption: 'none' },
      streamSettings: { network: 'tcp', security: 'tls' },
    },
  ],
  outbounds: [
    { tag: 'DIRECT', protocol: 'freedom' },
    { tag: 'BLOCK', protocol: 'blackhole' },
  ],
  routing: {
    rules: [
      { type: 'field', protocol: ['bittorrent'], outboundTag: 'BLOCK' },
      { type: 'field', ip: ['geoip:private'], outboundTag: 'BLOCK' },
    ],
  },
};

export function demoConfigProfiles(): GsConfigProfile[] {
  return [
    {
      uuid: 'demo-profile-0',
      name: 'Reality Prime',
      inbounds: [
        { uuid: 'ib-0', tag: 'VLESS_REALITY', protocol: 'vless', port: 443, network: 'tcp', security: 'reality' },
        { uuid: 'ib-1', tag: 'VLESS_VISION', protocol: 'vless', port: 8443, network: 'tcp', security: 'tls' },
      ],
      nodesUsing: 5,
      updatedAt: isoAgo(220),
      config: DEMO_XRAY_CONFIG,
    },
    {
      uuid: 'demo-profile-1',
      name: 'Vision Stealth',
      inbounds: [
        { uuid: 'ib-2', tag: 'TROJAN_WS', protocol: 'trojan', port: 2053, network: 'ws', security: 'tls' },
      ],
      nodesUsing: 2,
      updatedAt: isoAgo(1400),
      config: DEMO_XRAY_CONFIG,
    },
    {
      uuid: 'demo-profile-2',
      name: 'WARP Egress',
      inbounds: [
        { uuid: 'ib-3', tag: 'SS_2022', protocol: 'shadowsocks', port: 8388, network: 'tcp', security: 'none' },
      ],
      nodesUsing: 1,
      updatedAt: isoAgo(5600),
      config: DEMO_XRAY_CONFIG,
    },
  ];
}

export function demoSnippets(): GsSnippet[] {
  return [
    { uuid: 's-0', name: 'block-ads', content: '{ "type": "field", "domain": ["geosite:category-ads-all"], "outboundTag": "BLOCK" }', updatedAt: isoAgo(800) },
    { uuid: 's-1', name: 'warp-routing', content: '{ "type": "field", "domain": ["geosite:openai"], "outboundTag": "warp-out" }', updatedAt: isoAgo(1900) },
    { uuid: 's-2', name: 'sniffing', content: '{ "enabled": true, "destOverride": ["http", "tls", "quic"] }', updatedAt: isoAgo(140) },
  ];
}

export function demoHosts(): GsHost[] {
  const sec: GsHost['security'][] = ['reality', 'tls', 'reality', 'tls'];
  return ['🇩🇪 Germany Premium', '🇳🇱 Netherlands', '🇫🇮 Finland Fast', '🇯🇵 Japan Pacific'].map(
    (remark, i) => ({
      uuid: `host-${i}`,
      remark,
      address: `node${i}.ghost-sphere.app`,
      port: i % 2 === 0 ? 443 : 8443,
      sni: 'www.cloudflare.com',
      host: null,
      path: i % 2 === 0 ? null : '/ws',
      alpn: 'h2,http/1.1',
      fingerprint: 'chrome',
      security: sec[i],
      isDisabled: i === 3,
      configProfileUuid: 'demo-profile-0',
      inboundTag: 'VLESS_REALITY',
      viewPosition: i,
    }),
  );
}

const USER_NAMES = [
  'ghost_admin', 'neo_matrix', 'spectre_07', 'cipher_zero', 'phantom_io', 'aurora_vpn',
  'kuro_shadow', 'helios_run', 'vortex_pro', 'nyx_silent', 'orion_link', 'echo_drift',
  'lumen_x', 'raven_secure', 'pulse_max', 'zenith_gw', 'flux_node', 'mirage_user',
];

export function demoUsers(count = 142): GsUser[] {
  const statuses: GsUser['status'][] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'LIMITED', 'EXPIRED', 'DISABLED'];
  return Array.from({ length: count }, (_, i) => {
    const status = i < 3 ? 'ACTIVE' : pick(statuses);
    const limit = pick([100, 200, 500, 1000]) * GB;
    const used = status === 'LIMITED' ? limit : rand(0, Math.floor(limit * 0.85));
    const name = i < USER_NAMES.length ? USER_NAMES[i] : `${pick(USER_NAMES)}_${i}`;
    const short = Math.random().toString(36).slice(2, 18);
    return {
      uuid: `user-${i}`,
      shortUuid: short,
      username: name,
      status,
      usedTrafficBytes: used,
      trafficLimitBytes: limit,
      trafficStrategy: pick(['MONTH', 'MONTH', 'NO_RESET', 'WEEK']),
      expireAt: status === 'EXPIRED' ? isoAgo(rand(1, 40) * 1440) : new Date(Date.now() + rand(1, 120) * 86400000).toISOString(),
      isOnline: status === 'ACTIVE' && Math.random() > 0.45,
      onlineAt: isoAgo(rand(0, 4000)),
      squads: [pick(['Premium', 'Standard', 'Trial'])],
      hwidDeviceLimit: pick([null, 3, 5]),
      hwidDevicesUsed: rand(0, 4),
      telegramId: Math.random() > 0.5 ? String(rand(100000000, 999999999)) : null,
      email: Math.random() > 0.7 ? `${name}@mail.io` : null,
      subscriptionUrl: `https://sub.ghost-sphere.app/${short}`,
      createdAt: isoAgo(rand(60, 200000)),
    };
  });
}

export function demoSquads(): GsSquad[] {
  return [
    { uuid: 'sq-0', name: 'Premium', kind: 'internal', membersCount: 64, inbounds: ['VLESS_REALITY', 'VLESS_VISION'], excludedHosts: 0 },
    { uuid: 'sq-1', name: 'Standard', kind: 'internal', membersCount: 71, inbounds: ['VLESS_VISION'], excludedHosts: 1 },
    { uuid: 'sq-2', name: 'Trial', kind: 'internal', membersCount: 7, inbounds: ['VLESS_VISION'], excludedHosts: 2 },
    { uuid: 'sq-3', name: 'Resellers EU', kind: 'external', membersCount: 12, inbounds: ['VLESS_REALITY'], excludedHosts: 0 },
  ];
}

export function demoTokens(): GsApiToken[] {
  return [
    { uuid: 't-0', name: 'Ghost Sphere Core', tokenPreview: 'eyJhbGci…Q4f2', createdAt: isoAgo(40000) },
    { uuid: 't-1', name: 'Minishop bot', tokenPreview: 'eyJhbGci…7Kp1', createdAt: isoAgo(120000) },
    { uuid: 't-2', name: 'Cloudflare DNS', tokenPreview: 'eyJhbGci…9Zx0', createdAt: isoAgo(90000) },
  ];
}

export function demoSubTemplates(): GsSubscriptionTemplate[] {
  return [
    { uuid: 'st-0', type: 'XRAY_JSON', name: 'Xray JSON', updatedAt: isoAgo(300) },
    { uuid: 'st-1', type: 'CLASH', name: 'Clash / Mihomo', updatedAt: isoAgo(900) },
    { uuid: 'st-2', type: 'SINGBOX', name: 'Sing-box', updatedAt: isoAgo(1500) },
    { uuid: 'st-3', type: 'STASH', name: 'Stash', updatedAt: isoAgo(2400) },
  ];
}

export function demoIntegrations(): GsIntegration[] {
  return [
    { id: 'minishop', key: 'minishop', category: 'bots', status: 'connected', endpoint: 'https://shop.ghost-sphere.app', healthy: true, meta: { sales: '1 284' } },
    { id: 'adminBot', key: 'adminBot', category: 'bots', status: 'connected', endpoint: '@ghost_admin_bot', healthy: true },
    { id: 'cloudflare', key: 'cloudflare', category: 'infra', status: 'connected', endpoint: 'cloudflare.com', healthy: true, meta: { zones: '3' } },
    { id: 'xrayChecker', key: 'xrayChecker', category: 'monitoring', status: 'connected', endpoint: ':2112', healthy: true },
    { id: 'whitebox', key: 'whitebox', category: 'monitoring', status: 'disconnected', endpoint: null, healthy: false },
    { id: 'mcp', key: 'mcp', category: 'automation', status: 'connected', endpoint: 'stdio', healthy: true, meta: { tools: '153' } },
    { id: 'backupBot', key: 'backupBot', category: 'automation', status: 'connected', endpoint: 'telegram', healthy: true },
    { id: 'warp', key: 'warp', category: 'infra', status: 'disconnected', endpoint: null, healthy: false },
  ];
}

export function demoBackups(): GsBackup[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `backup-${i}`,
    createdAt: isoAgo(i * 1440 + rand(0, 200)),
    sizeBytes: rand(40, 320) * 1024 * 1024,
    destination: pick(['local', 's3', 'telegram', 'gdrive'] as const),
    includesDb: true,
    includesPanel: true,
    includesBots: i % 2 === 0,
    status: i === 0 ? 'success' : pick(['success', 'success', 'success', 'failed'] as const),
  }));
}

export function demoTemplates(): GsTemplate[] {
  return [
    { id: 'tpl-0', name: 'VLESS + REALITY (TCP)', kind: 'XRAY_JSON', author: 'remnawave-default', description: 'Эталонная нода REALITY с блокировкой торрентов.' },
    { id: 'tpl-1', name: 'VLESS Vision + Steal', kind: 'XRAY_JSON', author: 'ghost-os', description: 'Vision flow со стелс-маскировкой под сайт.' },
    { id: 'tpl-2', name: 'Clash Meta Universal', kind: 'SUBSCRIPTION', author: 'community', description: 'Универсальный шаблон Clash/Mihomo.', format: 'CLASH' },
    { id: 'tpl-3', name: 'Sing-box 1.10', kind: 'SUBSCRIPTION', author: 'community', description: 'Sing-box с авто-выбором.', format: 'SINGBOX' },
    { id: 'tpl-4', name: 'Subscription Page Aurora', kind: 'SUBPAGE', author: 'ghost-os', description: 'Премиальная страница подписки.' },
    { id: 'tpl-5', name: 'SRR Smart Match', kind: 'SRR', author: 'remnawave-default', description: 'Правила выдачи по User-Agent.' },
    { id: 'tpl-6', name: 'Torrent Blocker', kind: 'NODE_PLUGIN', author: 'remnawave-default', description: 'Плагин блокировки торрентов на ноде.' },
    { id: 'tpl-7', name: 'WARP Outbound Pack', kind: 'XRAY_JSON', author: 'ghost-os', description: 'Маршрутизация OpenAI/стриминга через WARP.' },
  ];
}

export function demoStats(nodes: GsNode[], users: GsUser[]): SphereStats {
  const onlineNodes = nodes.filter((n) => n.isConnected).length;
  const ramTotal = 32 * GB;
  const ramUsed = rand(10, 26) * GB;
  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'ACTIVE').length,
    onlineUsers: users.filter((u) => u.isOnline).length,
    totalNodes: nodes.length,
    onlineNodes,
    trafficTodayBytes: rand(8, 22) * TB,
    trafficMonthBytes: rand(340, 720) * TB,
    uptimeSeconds: rand(20, 90) * 86400,
    cpuPercent: rand(12, 58),
    ramPercent: Math.round((ramUsed / ramTotal) * 100),
    ramTotalBytes: ramTotal,
    ramUsedBytes: ramUsed,
    health: onlineNodes >= nodes.length - 1 ? 'operational' : onlineNodes > nodes.length / 2 ? 'degraded' : 'down',
  };
}

export function demoActivity(): ActivityEvent[] {
  const events: Array<Omit<ActivityEvent, 'id' | 'at'>> = [
    { kind: 'node', message: 'Нода «Frankfurt Core» подключена · 25.9.11', level: 'success' },
    { kind: 'user', message: 'Создан пользователь neo_matrix (Premium)', level: 'info' },
    { kind: 'config', message: 'Профиль «Reality Prime» применён к 5 нодам', level: 'success' },
    { kind: 'backup', message: 'Бэкап выгружен в Telegram · 184 MB', level: 'info' },
    { kind: 'integration', message: 'Cloudflare DNS обновил A-записи (3 ноды)', level: 'info' },
    { kind: 'user', message: 'У пользователя cipher_zero исчерпан лимит', level: 'warning' },
    { kind: 'node', message: 'Нода «New York Hub» отключена оператором', level: 'warning' },
    { kind: 'system', message: 'Ghost Sphere Core запущен · v0.0.1', level: 'success' },
  ];
  return events.map((e, i) => ({ ...e, id: `act-${i}`, at: isoAgo(i * rand(7, 90) + rand(1, 6)) }));
}

export function demoUserGrowth(): SeriesPoint[] {
  const labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  let base = 24;
  return labels.map((label) => {
    base += rand(4, 22);
    return { label, value: base, value2: Math.round(base * (0.5 + Math.random() * 0.3)) };
  });
}

export function demoTrafficSeries(): SeriesPoint[] {
  return Array.from({ length: 30 }, (_, i) => ({
    label: `${i + 1}`,
    value: rand(4, 22),
  }));
}

export function demoNodeLoad(nodes: GsNode[]): NodeLoadPoint[] {
  return nodes
    .filter((n) => n.isConnected)
    .map((n) => ({ name: n.name.split(' ')[0], traffic: Math.round(n.trafficUsedBytes / TB), users: n.usersOnline }))
    .sort((a, b) => b.traffic - a.traffic)
    .slice(0, 6);
}
