import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DEFAULT_ROLES } from '@apulse/shared';

import { Role } from '../entities/role.entity.js';

@Injectable()
export class RolesSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(RolesSeed.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    for (const role of DEFAULT_ROLES) {
      await this.roleRepository.upsert(role, ['code']);
    }

    this.logger.log('Default roles seeded successfully.');
  }
}
