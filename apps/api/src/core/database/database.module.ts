import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import pg from 'pg';
import { DatabaseService } from './database.service.js';
import { formatError } from '../config/redact-sensitive-values.js';

const logger = new Logger('Database');

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        logger.log(
          `Initializing TypeORM using ${databaseUrl ? 'DATABASE_URL' : 'POSTGRES_*'} configuration.`,
        );

        return {
          type: 'postgres',
          driver: pg,
          ...(databaseUrl
            ? {
                url: databaseUrl,
                ssl: { rejectUnauthorized: false },
              }
            : {
                host: config.getOrThrow<string>('POSTGRES_HOST'),
                port: config.get<number>('POSTGRES_PORT', 5432),
                username: config.getOrThrow<string>('POSTGRES_USER'),
                password: config.getOrThrow<string>('POSTGRES_PASSWORD'),
                database: config.getOrThrow<string>('POSTGRES_DB'),
              }),
          autoLoadEntities: true,
          synchronize: config.get('NODE_ENV') !== 'production',
          logging: config.get('NODE_ENV') === 'development',

          retryAttempts: 1,
          retryDelay: 1000,

          toRetry: (error: Error) => {
            logger.error('Database connection failed.', formatError(error));
            return true;
          },
        };
      },
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
