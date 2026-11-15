import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
): void {
  const swaggerEnabled =
    configService.get<string>('SWAGGER_ENABLED')?.toLowerCase() ??
    (configService.get<string>('NODE_ENV') === 'production' ? 'false' : 'true');

  if (swaggerEnabled !== 'true') {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Apulse API')
    .setDescription('API documentation for the Apulse platform.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token.',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
