import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RemnawaveService } from './common/remnawave/remnawave.service';
import { HealthController } from './modules/health.controller';
import { AuthController } from './modules/auth.controller';
import { SystemController } from './modules/system.controller';
import { NodesController } from './modules/nodes.controller';
import { CatalogController } from './modules/catalog.controller';
import { UsersController } from './modules/users.controller';
import { NativeController } from './modules/native.controller';
import { NativeService } from './modules/native.service';
import { ProxyController } from './modules/proxy.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [
    HealthController,
    AuthController,
    SystemController,
    NodesController,
    CatalogController,
    UsersController,
    NativeController,
    ProxyController,
  ],
  providers: [RemnawaveService, NativeService],
})
export class AppModule {}
