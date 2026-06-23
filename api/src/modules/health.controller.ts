import { Controller, Get } from '@nestjs/common';
import { APP_VERSION } from '../common/version';

@Controller()
export class HealthController {
  @Get('healthz')
  health() {
    return {
      status: 'ok',
      service: 'ghost-sphere-core',
      version: APP_VERSION,
      vendor: 'Ghost OS',
      time: new Date().toISOString(),
    };
  }
}
