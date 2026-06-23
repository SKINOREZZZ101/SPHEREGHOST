import { Injectable } from '@nestjs/common';

// Ghost Sphere-native resources (not part of Remnawave): the integration
// registry, backup orchestration metadata and the template catalog.
// Held in-memory for 0.0.1; a persistent store can be added later.

@Injectable()
export class NativeService {
  private integrations = defaultIntegrations();
  private backups: any[] = [];

  listIntegrations() {
    return this.integrations;
  }

  toggleIntegration(id: string) {
    const it = this.integrations.find((x) => x.id === id);
    if (it) {
      it.status = it.status === 'connected' ? 'disconnected' : 'connected';
      it.healthy = it.status === 'connected';
    }
    return { ok: true };
  }

  listBackups() {
    return this.backups;
  }

  createBackup(payload: any) {
    const b = {
      id: cryptoId(),
      createdAt: new Date().toISOString(),
      sizeBytes: Math.floor((40 + Math.random() * 200) * 1024 * 1024),
      destination: payload?.destination ?? 'local',
      includesDb: payload?.includesDb ?? true,
      includesPanel: payload?.includesPanel ?? true,
      includesBots: payload?.includesBots ?? false,
      status: 'success',
    };
    this.backups.unshift(b);
    return b;
  }

  listTemplates() {
    return TEMPLATE_CATALOG;
  }
}

function cryptoId(): string {
  return 'b_' + Math.random().toString(36).slice(2, 12);
}

function defaultIntegrations() {
  return [
    { id: 'minishop', key: 'minishop', category: 'bots', status: 'disconnected', endpoint: null, healthy: false },
    { id: 'adminBot', key: 'adminBot', category: 'bots', status: 'disconnected', endpoint: null, healthy: false },
    { id: 'cloudflare', key: 'cloudflare', category: 'infra', status: 'disconnected', endpoint: null, healthy: false },
    { id: 'xrayChecker', key: 'xrayChecker', category: 'monitoring', status: 'disconnected', endpoint: null, healthy: false },
    { id: 'whitebox', key: 'whitebox', category: 'monitoring', status: 'disconnected', endpoint: null, healthy: false },
    { id: 'mcp', key: 'mcp', category: 'automation', status: 'disconnected', endpoint: null, healthy: false },
    { id: 'backupBot', key: 'backupBot', category: 'automation', status: 'disconnected', endpoint: null, healthy: false },
    { id: 'warp', key: 'warp', category: 'infra', status: 'disconnected', endpoint: null, healthy: false },
  ];
}

const TEMPLATE_CATALOG = [
  { id: 'tpl-0', name: 'VLESS + REALITY (TCP)', kind: 'XRAY_JSON', author: 'remnawave-default', description: 'Reference REALITY node with torrent blocking.' },
  { id: 'tpl-1', name: 'VLESS Vision + Steal', kind: 'XRAY_JSON', author: 'ghost-os', description: 'Vision flow with stealth site masking.' },
  { id: 'tpl-2', name: 'Clash Meta Universal', kind: 'SUBSCRIPTION', author: 'community', description: 'Universal Clash/Mihomo template.', format: 'CLASH' },
  { id: 'tpl-3', name: 'Sing-box 1.10', kind: 'SUBSCRIPTION', author: 'community', description: 'Sing-box with auto-select.', format: 'SINGBOX' },
  { id: 'tpl-4', name: 'Subscription Page Aurora', kind: 'SUBPAGE', author: 'ghost-os', description: 'Premium subscription page.' },
  { id: 'tpl-5', name: 'SRR Smart Match', kind: 'SRR', author: 'remnawave-default', description: 'User-Agent based delivery rules.' },
  { id: 'tpl-6', name: 'Torrent Blocker', kind: 'NODE_PLUGIN', author: 'remnawave-default', description: 'Torrent blocking node plugin.' },
  { id: 'tpl-7', name: 'WARP Outbound Pack', kind: 'XRAY_JSON', author: 'ghost-os', description: 'Route OpenAI/streaming via WARP.' },
];
