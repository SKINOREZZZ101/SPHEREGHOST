import { BadRequestException, Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'http';
import { RemnawaveService } from '../common/remnawave/remnawave.service';
import { panelFromHeaders } from '../common/remnawave/panel.types';
import { mapUser } from '../common/mappers';
import { pickArray } from '../common/util';
import type { GsUser } from '../common/dto';

const ACTIONS = new Set(['enable', 'disable', 'reset-traffic', 'revoke']);

@Controller('users')
export class UsersController {
  constructor(private readonly rw: RemnawaveService) {}

  @Get()
  async list(@Headers() headers: IncomingHttpHeaders): Promise<GsUser[]> {
    const creds = panelFromHeaders(headers);
    const raw = await this.rw.get<any>(creds, '/users?size=500&start=0');
    return pickArray(raw, ['users']).map(mapUser);
  }

  @Post()
  async create(@Headers() headers: IncomingHttpHeaders, @Body() body: Partial<GsUser>) {
    const creds = panelFromHeaders(headers);
    const payload = {
      username: body.username,
      trafficLimitBytes: body.trafficLimitBytes ?? 0,
      trafficLimitStrategy: body.trafficStrategy ?? 'NO_RESET',
      expireAt: body.expireAt ?? new Date(Date.now() + 30 * 86400000).toISOString(),
      hwidDeviceLimit: body.hwidDeviceLimit ?? undefined,
      telegramId: body.telegramId ? Number(body.telegramId) : undefined,
      email: body.email ?? undefined,
    };
    const created = await this.rw.post<any>(creds, '/users', payload);
    return mapUser(created ?? {});
  }

  @Post(':uuid/actions/:action')
  async action(
    @Headers() headers: IncomingHttpHeaders,
    @Param('uuid') uuid: string,
    @Param('action') action: string,
  ) {
    if (!ACTIONS.has(action)) throw new BadRequestException(`Unknown action: ${action}`);
    const creds = panelFromHeaders(headers);
    await this.rw.post(creds, `/users/${uuid}/actions/${action}`);
    return { ok: true };
  }
}
