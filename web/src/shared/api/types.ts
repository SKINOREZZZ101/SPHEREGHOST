// Domain types for Ghost Sphere. These mirror the Remnawave 2.7.x entity
// shapes (subset) plus Ghost Sphere-specific additions.

export type NodeStatus = 'connected' | 'connecting' | 'disconnected' | 'disabled';

export interface GsNode {
  uuid: string;
  name: string;
  address: string;
  port: number;
  countryCode: string;
  status: NodeStatus;
  isConnected: boolean;
  isDisabled: boolean;
  isConnecting: boolean;
  xrayVersion: string | null;
  nodeVersion: string | null;
  usersOnline: number;
  xrayUptimeSeconds: number;
  trafficUsedBytes: number;
  trafficLimitBytes: number | null;
  consumptionMultiplier: number;
  cpuPercent: number;
  ramPercent: number;
  activeConfigProfileUuid: string | null;
  activeConfigProfileName: string | null;
  activeInbounds: string[];
  tags: string[];
  viewPosition: number;
  lastStatusMessage: string | null;
  lastStatusChange: string | null;
}

export type InboundProtocol =
  | 'vless'
  | 'vmess'
  | 'trojan'
  | 'shadowsocks'
  | 'socks'
  | 'http'
  | 'wireguard';

export interface GsInbound {
  uuid: string;
  tag: string;
  protocol: InboundProtocol;
  port: number;
  network: string;
  security: string;
}

export interface GsConfigProfile {
  uuid: string;
  name: string;
  inbounds: GsInbound[];
  nodesUsing: number;
  updatedAt: string;
  config: Record<string, unknown>;
}

export interface GsSnippet {
  uuid: string;
  name: string;
  content: string;
  updatedAt: string;
}

export type HostSecurity = 'tls' | 'reality' | 'none';

export interface GsHost {
  uuid: string;
  remark: string;
  address: string;
  port: number;
  sni: string | null;
  host: string | null;
  path: string | null;
  alpn: string | null;
  fingerprint: string | null;
  security: HostSecurity;
  isDisabled: boolean;
  configProfileUuid: string | null;
  inboundTag: string | null;
  viewPosition: number;
}

export type UserStatus = 'ACTIVE' | 'DISABLED' | 'LIMITED' | 'EXPIRED';
export type TrafficStrategy = 'NO_RESET' | 'DAY' | 'WEEK' | 'MONTH';

export interface GsUser {
  uuid: string;
  shortUuid: string;
  username: string;
  status: UserStatus;
  usedTrafficBytes: number;
  trafficLimitBytes: number;
  trafficStrategy: TrafficStrategy;
  expireAt: string | null;
  isOnline: boolean;
  onlineAt: string | null;
  squads: string[];
  hwidDeviceLimit: number | null;
  hwidDevicesUsed: number;
  telegramId: string | null;
  email: string | null;
  subscriptionUrl: string;
  createdAt: string;
}

export type SubscriptionFormat = 'XRAY_JSON' | 'XRAY_BASE64' | 'CLASH' | 'MIHOMO' | 'SINGBOX' | 'STASH';

export interface GsSubscriptionTemplate {
  uuid: string;
  type: SubscriptionFormat;
  name: string;
  updatedAt: string;
}

export interface GsSquad {
  uuid: string;
  name: string;
  kind: 'internal' | 'external';
  membersCount: number;
  inbounds: string[];
  excludedHosts: number;
}

export interface GsApiToken {
  uuid: string;
  name: string;
  tokenPreview: string;
  createdAt: string;
}

export type IntegrationCategory = 'bots' | 'monitoring' | 'infra' | 'automation' | 'tools';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface GsIntegration {
  id: string;
  key: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  endpoint: string | null;
  healthy: boolean;
  meta?: Record<string, string>;
}

export type BackupDestination = 'local' | 's3' | 'gdrive' | 'telegram';

export interface GsBackup {
  id: string;
  createdAt: string;
  sizeBytes: number;
  destination: BackupDestination;
  includesDb: boolean;
  includesPanel: boolean;
  includesBots: boolean;
  status: 'success' | 'running' | 'failed';
}

export type TemplateKind = 'XRAY_JSON' | 'SUBSCRIPTION' | 'SUBPAGE' | 'SRR' | 'NODE_PLUGIN';

export interface GsTemplate {
  id: string;
  name: string;
  kind: TemplateKind;
  author: string;
  description: string;
  format?: string;
}

export interface SphereStats {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  totalNodes: number;
  onlineNodes: number;
  trafficTodayBytes: number;
  trafficMonthBytes: number;
  uptimeSeconds: number;
  cpuPercent: number;
  ramPercent: number;
  ramTotalBytes: number;
  ramUsedBytes: number;
  health: 'operational' | 'degraded' | 'down';
}

export interface ActivityEvent {
  id: string;
  kind: 'node' | 'user' | 'config' | 'backup' | 'integration' | 'system';
  message: string;
  at: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export interface SeriesPoint {
  label: string;
  value: number;
  value2?: number;
}

export interface NodeLoadPoint {
  name: string;
  traffic: number;
  users: number;
}
