import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { setupSwagger } from './core/config/swagger.config.js';
import { ConfigService } from '@nestjs/config';
import { validationConfig } from './core/config/validation.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.setGlobalPrefix('api');
  const corsOrigins = (process.env.CORS_ORIGINS ?? '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  //validation setup
  app.useGlobalPipes(validationConfig);

  // setup Swagger.
  const configService = app.get(ConfigService);

  setupSwagger(app, configService);

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
