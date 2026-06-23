import { Controller, Get, Headers } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import { RemnawaveService } from '../common/remnawave/remnawave.service';
import { panelFromHeaders } from '../common/remnawave/panel.types';
import { mapNode } from '../common/mappers';
import type { SphereStats } from '../common/dto';

@Controller('system')
export class SystemController {
  constructor(private readonly rw: RemnawaveService) {}

  @Get('stats')
  async stats(@Headers() headers: IncomingHttpHeaders): Promise<SphereStats> {
    const creds = panelFromHeaders(headers);
    const nodesRaw = await this.rw.get<any[]>(creds, '/nodes').catch(() => []);
    const nodes = (Array.isArray(nodesRaw) ? nodesRaw : []).map(mapNode);

    let panelStats: any = {};
    try {
      panelStats = await this.rw.get<any>(creds, '/system/stats');
    } catch {
      panelStats = {};
    }

    const onlineNodes = nodes.filter((n) => n.isConnected).length;
    const onlineUsers = nodes.reduce((a, n) => a + n.usersOnline, 0);
    const users = panelStats.users ?? {};
    const memory = panelStats.memory ?? panelStats.ram ?? {};
    const ramTotal = Number(memory.total ?? 0);
    const ramUsed = Number(memory.used ?? 0);

    return {
      totalUsers: Number(users.totalUsers ?? users.total ?? panelStats.totalUsers ?? 0),
      activeUsers: Number(users.statusCounts?.ACTIVE ?? users.activeUsers ?? 0),
      onlineUsers: Number(users.onlineLastMinute ?? onlineUsers),
      totalNodes: nodes.length,
      onlineNodes,
      trafficTodayBytes: Number(panelStats.nodesRealtimeUsage?.totalBytes ?? 0),
      trafficMonthBytes: Number(panelStats.bandwidth?.monthBytes ?? 0),
      uptimeSeconds: Number(panelStats.uptime ?? 0),
      cpuPercent: Math.round(
        nodes.reduce((a, n) => a + n.cpuPercent, 0) / Math.max(1, nodes.length),
      ),
      ramPercent: ramTotal ? Math.round((ramUsed / ramTotal) * 100) : 0,
      ramTotalBytes: ramTotal,
      ramUsedBytes: ramUsed,
      health: onlineNodes >= nodes.length - 1 ? 'operational' : onlineNodes > nodes.length / 2 ? 'degraded' : 'down',
    };
  }

  @Get('activity')
  activity() {
    // Reserved for a future audit/event stream. Empty in live mode for now.
    return [];
  }

  @Get('stats/user-growth')
  userGrowth() {
    return [];
  }

  @Get('stats/traffic')
  traffic() {
    return [];
  }

  @Get('stats/node-load')
  async nodeLoad(@Headers() headers: IncomingHttpHeaders) {
    const creds = panelFromHeaders(headers);
    const nodesRaw = await this.rw.get<any[]>(creds, '/nodes').catch(() => []);
    const TB = 1024 ** 4;
    return (Array.isArray(nodesRaw) ? nodesRaw : [])
      .map(mapNode)
      .filter((n) => n.isConnected)
      .map((n) => ({ name: n.name.split(' ')[0], traffic: Math.round(n.trafficUsedBytes / TB), users: n.usersOnline }))
      .sort((a, b) => b.traffic - a.traffic)
      .slice(0, 6);
  }

  @Get('tools/x25519')
  async x25519(@Headers() headers: IncomingHttpHeaders) {
    const creds = panelFromHeaders(headers);
    const res = await this.rw.get<any>(creds, '/system/tools/x25519/generate');
    return { privateKey: res?.privateKey ?? '', publicKey: res?.publicKey ?? '' };
  }

  // The real node SECRET_KEY (encoded cert payload) from the engine keygen.
  @Get('keygen')
  async keygen(@Headers() headers: IncomingHttpHeaders) {
    const creds = panelFromHeaders(headers);
    const res = await this.rw.get<any>(creds, '/keygen');
    return { secretKey: res?.pubKey ?? '' };
  }
}
