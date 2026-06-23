import { All, Controller, Headers, Param, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { IncomingHttpHeaders } from 'http';
import type { Method } from 'axios';
import { RemnawaveService } from '../common/remnawave/remnawave.service';
import { panelFromHeaders } from '../common/remnawave/panel.types';

/**
 * Transparent passthrough to the bundled Ghost Sphere Engine.
 *
 * Any request to /api/rw/<engine-path> is forwarded to the engine's /api/<engine-path>
 * with the caller's admin JWT, returning the raw engine response. This instantly
 * exposes the ENTIRE Remnawave API (users, hosts, squads, subscription templates,
 * SRR, HWID, torrent reports, sessions, settings, bandwidth, etc.) to the premium
 * Ghost Sphere UI without hand-mapping every endpoint.
 */
@Controller('rw')
export class ProxyController {
  constructor(private readonly rw: RemnawaveService) {}

  @All('*')
  async passthrough(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: IncomingHttpHeaders,
    @Param() params: Record<string, string>,
    @Query() query: Record<string, string>,
  ) {
    const creds = panelFromHeaders(headers);

    // Everything after /api/rw/
    const wildcard = params['0'] ?? '';
    const qs = req.originalUrl.includes('?') ? `?${req.originalUrl.split('?')[1]}` : '';
    const enginePath = `/${wildcard}${qs}`;

    const result = await this.rw.raw(
      creds,
      req.method as Method,
      enginePath,
      ['GET', 'HEAD', 'DELETE'].includes(req.method) ? undefined : req.body,
    );

    res.status(result.status).json(result.data);
  }
}
