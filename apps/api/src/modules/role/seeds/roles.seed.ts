import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from '../entities/role.entity.js';

const defaultRoles = [
  {
    name: 'Super Admin',
    code: 'super_admin',
    description: 'Full access to all system features.',
  },
  {
    name: 'Admin',
    code: 'admin',
    description: 'Administrative access to the system.',
  },
  {
    name: 'Sales Manager',
    code: 'sales_manager',
    description: 'Manages sales operations and employees.',
  },
  {
    name: 'Employee',
    code: 'employee',
    description: 'Standard internal employee access.',
  },
  {
    name: 'Customer',
    code: 'customer',
    description: 'Customer account access.',
  },
  {
    name: 'Lead',
    code: 'leads',
    description: 'Potential customer who has not yet converted.',
  },
];

@Injectable()
export class RolesSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(RolesSeed.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    for (const role of defaultRoles) {
      await this.roleRepository.upsert(role, ['code']);
    }

    this.logger.log('Default roles seeded successfully.');
  }
}
