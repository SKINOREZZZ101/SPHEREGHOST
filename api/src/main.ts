import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { APP_NAME, APP_VERSION } from './common/version';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api', { exclude: ['healthz'] });

  const port = Number(process.env.PORT ?? process.env.GS_API_PORT ?? 8088);
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`${APP_NAME} v${APP_VERSION} listening on http://0.0.0.0:${port}`);
  logger.log('Ghost OS · The sphere is online.');
}

void bootstrap();
