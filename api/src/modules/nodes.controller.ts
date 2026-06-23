import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Post } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import { RemnawaveService } from '../common/remnawave/remnawave.service';
import { panelFromHeaders } from '../common/remnawave/panel.types';
import { mapNode } from '../common/mappers';
import type { GsNode } from '../common/dto';

const ACTIONS = new Set(['enable', 'disable', 'restart', 'reset-traffic']);

@Controller('nodes')
export class NodesController {
  constructor(private readonly rw: RemnawaveService) {}

  @Get()
  async list(@Headers() headers: IncomingHttpHeaders): Promise<GsNode[]> {
    const creds = panelFromHeaders(headers);
    const raw = await this.rw.get<any[]>(creds, '/nodes');
    return (Array.isArray(raw) ? raw : []).map(mapNode).sort((a, b) => a.viewPosition - b.viewPosition);
  }

  @Post()
  async create(@Headers() headers: IncomingHttpHeaders, @Body() body: Partial<GsNode>) {
    const creds = panelFromHeaders(headers);
    // The engine requires configProfile to be nested with a valid profile UUID
    // and an array of inbound UUIDs.
    const payload: Record<string, unknown> = {
      name: body.name,
      address: body.address,
      port: body.port ?? 2222,
      countryCode: (body.countryCode || 'XX').toUpperCase().slice(0, 2),
      isTrafficTrackingActive: false,
      configProfile: {
        activeConfigProfileUuid: body.activeConfigProfileUuid,
        activeInbounds: Array.isArray(body.activeInbounds) ? body.activeInbounds : [],
      },
    };
    if (body.consumptionMultiplier) payload.consumptionMultiplier = body.consumptionMultiplier;
    if (body.trafficLimitBytes) payload.trafficLimitBytes = body.trafficLimitBytes;
    const created = await this.rw.post<any>(creds, '/nodes', payload);
    return mapNode(created ?? {});
  }

  @Post(':uuid/actions/:action')
  async action(
    @Headers() headers: IncomingHttpHeaders,
    @Param('uuid') uuid: string,
    @Param('action') action: string,
  ) {
    if (!ACTIONS.has(action)) throw new BadRequestException(`Unknown action: ${action}`);
    const creds = panelFromHeaders(headers);
    await this.rw.post(creds, `/nodes/${uuid}/actions/${action}`);
    return { ok: true };
  }

  @Delete(':uuid')
  async remove(@Headers() headers: IncomingHttpHeaders, @Param('uuid') uuid: string) {
    const creds = panelFromHeaders(headers);
    await this.rw.delete(creds, `/nodes/${uuid}`);
    return { ok: true };
  }
}
