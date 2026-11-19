import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  private readonly sql: NeonQueryFunction<false, false>;

  constructor(configService: ConfigService) {
    this.sql = neon(configService.getOrThrow<string>('DATABASE_URL'));
  }

  async getData() {
    return this.sql`SELECT 1 AS connected`;
  }
}
