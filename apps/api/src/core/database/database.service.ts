import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly sql: NeonQueryFunction<false, false>;

  constructor(
    configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.sql = neon(configService.getOrThrow<string>('DATABASE_URL'));
  }

  onModuleInit(): void {
    this.logger.log(
      `TypeORM data source initialized: ${this.dataSource.isInitialized}.`,
    );
  }

  async getData() {
    return this.sql`SELECT 1 AS connected`;
  }
}
