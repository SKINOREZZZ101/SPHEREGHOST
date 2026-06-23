import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NativeService } from './native.service';

@Controller()
export class NativeController {
  constructor(private readonly native: NativeService) {}

  @Get('integrations')
  integrations() {
    return this.native.listIntegrations();
  }

  @Post('integrations/:id/toggle')
  toggle(@Param('id') id: string) {
    return this.native.toggleIntegration(id);
  }

  @Get('backups')
  backups() {
    return this.native.listBackups();
  }

  @Post('backups')
  createBackup(@Body() body: any) {
    return this.native.createBackup(body);
  }

  @Get('storage/templates')
  templates() {
    return this.native.listTemplates();
  }
}
