import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PermissionCode } from '@apulse/shared';
import { Permission } from './entities/permission.entity.js';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findByCode(code: PermissionCode): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { code },
    });
  }

  async findById(id: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { id },
    });
  }
}
