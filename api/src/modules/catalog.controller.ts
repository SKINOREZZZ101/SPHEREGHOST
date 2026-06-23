import { Body, Controller, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import { RemnawaveService } from '../common/remnawave/remnawave.service';
import { panelFromHeaders } from '../common/remnawave/panel.types';
import { mapConfigProfile } from '../common/mappers';
import { pickArray } from '../common/util';

@Controller()
export class CatalogController {
  constructor(private readonly rw: RemnawaveService) {}

  // ---- config profiles ----
  @Get('config-profiles')
  async profiles(@Headers() headers: IncomingHttpHeaders) {
    const creds = panelFromHeaders(headers);
    const raw = await this.rw.get<any>(creds, '/config-profiles');
    return pickArray(raw, ['configProfiles']).map(mapConfigProfile);
  }

  @Get('config-profiles/:uuid')
  async profile(@Headers() headers: IncomingHttpHeaders, @Param('uuid') uuid: string) {
    const creds = panelFromHeaders(headers);
    const raw = await this.rw.get<any>(creds, `/config-profiles/${uuid}`);
    return mapConfigProfile(raw ?? {});
  }

  @Patch('config-profiles')
  async saveProfile(@Headers() headers: IncomingHttpHeaders, @Body() body: { uuid: string; config: unknown }) {
    const creds = panelFromHeaders(headers);
    await this.rw.patch(creds, '/config-profiles', body);
    return { ok: true };
  }

  // ---- snippets ----
  @Get('snippets')
  async snippets(@Headers() headers: IncomingHttpHeaders) {
    const creds = panelFromHeaders(headers);
    const raw = await this.rw.get<any>(creds, '/snippets').catch(() => []);
    return pickArray(raw, ['snippets']).map((s: any) => ({
      uuid: String(s.uuid ?? s.name ?? ''),
      name: String(s.name ?? ''),
      content: typeof s.content === 'string' ? s.content : JSON.stringify(s.content ?? {}),
      updatedAt: s.updatedAt ?? new Date().toISOString(),
    }));
  }

  // ---- hosts ----
  @Get('hosts')
  async hosts(@Headers() headers: IncomingHttpHeaders) {
    const creds = panelFromHeaders(headers);
    const raw = await this.rw.get<any>(creds, '/hosts').catch(() => []);
    return pickArray(raw, ['hosts']).map((h: any) => ({
      uuid: String(h.uuid ?? ''),
      remark: String(h.remark ?? h.name ?? ''),
      address: String(h.address ?? ''),
      port: Number(h.port ?? 443),
      sni: h.sni ?? null,
      host: h.host ?? null,
      path: h.path ?? null,
      alpn: h.alpn ?? null,
      fingerprint: h.fingerprint ?? null,
      security: (h.securityLayer ?? h.security ?? 'none').toLowerCase().includes('reality')
        ? 'reality'
        : (h.securityLayer ?? h.security ?? 'none').toLowerCase().includes('tls')
          ? 'tls'
          : 'none',
      isDisabled: !!h.isDisabled,
      configProfileUuid: h.configProfileUuid ?? h.inbound?.configProfileUuid ?? null,
      inboundTag: h.inbound?.configProfileInboundUuid ?? h.inboundTag ?? null,
      viewPosition: Number(h.viewPosition ?? 0),
    }));
  }

  // ---- squads ----
  @Get('squads')
  async squads(@Headers() headers: IncomingHttpHeaders) {
    const creds = panelFromHeaders(headers);
    const [internalRaw, externalRaw] = await Promise.all([
      this.rw.get<any>(creds, '/internal-squads').catch(() => []),
      this.rw.get<any>(creds, '/external-squads').catch(() => []),
    ]);
    const internal = pickArray(internalRaw, ['internalSquads']).map((s: any) => ({
      uuid: String(s.uuid ?? ''),
      name: String(s.name ?? ''),
      kind: 'internal' as const,
      membersCount: Number(s.info?.membersCount ?? s.membersCount ?? 0),
      inbounds: pickArray(s.inbounds, []).map((i: any) => i?.tag ?? i).filter(Boolean),
      excludedHosts: Number(s.info?.excludedHostsCount ?? 0),
    }));
    const external = pickArray(externalRaw, ['externalSquads']).map((s: any) => ({
      uuid: String(s.uuid ?? ''),
      name: String(s.name ?? ''),
      kind: 'external' as const,
      membersCount: Number(s.info?.membersCount ?? s.membersCount ?? 0),
      inbounds: [],
      excludedHosts: 0,
    }));
    return [...internal, ...external];
  }

  // ---- subscription templates ----
  @Get('subscriptions/templates')
  async subTemplates(@Headers() headers: IncomingHttpHeaders) {
    const creds = panelFromHeaders(headers);
    const raw = await this.rw.get<any>(creds, '/subscription-templates').catch(() => []);
    return pickArray(raw, ['templates']).map((t: any) => ({
      uuid: String(t.uuid ?? t.templateType ?? ''),
      type: String(t.templateType ?? 'XRAY_JSON'),
      name: String(t.templateType ?? t.name ?? 'Template'),
      updatedAt: t.updatedAt ?? new Date().toISOString(),
    }));
  }

  // ---- api tokens ----
  @Get('keys/tokens')
  async tokens(@Headers() headers: IncomingHttpHeaders) {
    const creds = panelFromHeaders(headers);
    const raw = await this.rw.get<any>(creds, '/tokens').catch(() => []);
    return pickArray(raw, ['apiKeys', 'tokens']).map((t: any) => {
      const value = String(t.token ?? '');
      return {
        uuid: String(t.uuid ?? ''),
        name: String(t.tokenName ?? t.name ?? 'token'),
        tokenPreview: value ? `${value.slice(0, 8)}…${value.slice(-4)}` : '••••',
        createdAt: t.createdAt ?? new Date().toISOString(),
      };
    });
  }

  @Post('keys/tokens')
  async createToken(@Headers() headers: IncomingHttpHeaders, @Body() body: { name: string }) {
    const creds = panelFromHeaders(headers);
    const res = await this.rw.post<any>(creds, '/tokens', { tokenName: body.name });
    return { token: String(res?.token ?? '') };
  }
}
