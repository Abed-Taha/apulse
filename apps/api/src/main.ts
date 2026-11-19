import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { setupSwagger } from './core/config/swagger.config.js';
import { ConfigService } from '@nestjs/config';
import { validationConfig } from './core/config/validation.config.js';
import { formatError } from './core/config/redact-sensitive-values.js';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  logger.log('[BOOT] Starting NestJS');

  try {
    logger.log('[BOOT] Creating Nest application');
    const app = await NestFactory.create(AppModule, {
      instrument: ObserveInstrument,
    });
    logger.log('[BOOT] Nest application created');

    app.setGlobalPrefix('api');

    logger.log('[BOOT] Configuring CORS');
    const defaultCorsOrigins = [
      'https://apulse-cwfe-git-main-apulse.vercel.app',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
    const corsOrigins = (
      process.env.CORS_ORIGINS ?? defaultCorsOrigins.join(',')
    )
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (corsOrigins.includes('*')) {
      throw new Error(
        'CORS_ORIGINS must contain explicit origins when credentials are enabled.',
      );
    }

    logger.log(
      `[BOOT] CORS origins: ${corsOrigins.length ? corsOrigins.join(', ') : '(none)'}`,
    );
    app.enableCors({
      origin: corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      optionsSuccessStatus: 204,
    });

    app.useGlobalPipes(validationConfig);

    const configService = app.get(ConfigService);
    setupSwagger(app, configService);

    logger.log('[BOOT] Initializing application');
    await app.init();
    logger.log('[BOOT] Application initialized');

    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    logger.log(`[BOOT] Bootstrap completed on port ${port}`);
  } catch (error) {
    logger.error(`[BOOT] Bootstrap failed:\n${formatError(error)}`);
    throw error;
  }
}
await bootstrap();
