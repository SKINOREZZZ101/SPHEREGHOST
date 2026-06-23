import { Body, Controller, Get, Post } from '@nestjs/common';
import { RemnawaveService } from '../common/remnawave/remnawave.service';
import { engineUrl, type PanelCreds } from '../common/remnawave/panel.types';

/**
 * Auth proxy to the bundled Ghost Sphere Engine. Login/register/status are
 * public (no token required); the web uses these to obtain the admin JWT.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly rw: RemnawaveService) {}

  private creds(): PanelCreds {
    return { url: engineUrl(), token: '' };
  }

  @Get('status')
  status() {
    return this.rw.get(this.creds(), '/auth/status');
  }

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.rw.post(this.creds(), '/auth/login', body);
  }

  @Post('register')
  register(@Body() body: { username: string; password: string }) {
    return this.rw.post(this.creds(), '/auth/register', body);
  }
}
