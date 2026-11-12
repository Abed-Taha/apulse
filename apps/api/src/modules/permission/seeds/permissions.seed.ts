import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_PERMISSIONS } from '@apulse/shared';
import { Permission } from '../entities/permission.entity.js';

@Injectable()
export class PermissionsSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionsSeed.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedPermissions();
  }

  async seedPermissions(): Promise<void> {
    const existing = await this.permissionRepository.find();
    const existingCodes = new Set(existing.map((item) => item.code));

    const missing = DEFAULT_PERMISSIONS.filter(
      (perm) => !existingCodes.has(perm.code),
    );

    if (missing.length === 0) {
      this.logger.log('Default domain permissions already up to date.');
      return;
    }

    for (const permission of missing) {
      await this.permissionRepository.save(
        this.permissionRepository.create({
          name: permission.name,
          code: permission.code,
        }),
      );
    }

    this.logger.log(
      `Successfully seeded ${missing.length} missing default permission(s).`,
    );
  }
}
