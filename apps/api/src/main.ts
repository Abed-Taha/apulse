import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { setupSwagger } from './core/config/swagger.config.js';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // setup Swagger.
  const configService = app.get(ConfigService);

  setupSwagger(app, configService);

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
