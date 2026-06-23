// Ghost Sphere DTOs returned to the web client. These intentionally mirror the
// web's `@shared/api/types` so live mode and demo mode are interchangeable.

export interface GsNode {
  uuid: string;
  name: string;
  address: string;
  port: number;
  countryCode: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'disabled';
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

export interface GsUser {
  uuid: string;
  shortUuid: string;
  username: string;
  status: 'ACTIVE' | 'DISABLED' | 'LIMITED' | 'EXPIRED';
  usedTrafficBytes: number;
  trafficLimitBytes: number;
  trafficStrategy: 'NO_RESET' | 'DAY' | 'WEEK' | 'MONTH';
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

export interface GsConfigProfile {
  uuid: string;
  name: string;
  inbounds: Array<{
    uuid: string;
    tag: string;
    protocol: string;
    port: number;
    network: string;
    security: string;
  }>;
  nodesUsing: number;
  updatedAt: string;
  config: Record<string, unknown>;
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
