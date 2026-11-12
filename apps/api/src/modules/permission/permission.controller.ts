import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PermissionCode } from '@apulse/shared';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../core/guards/permissions.guard.js';
import { RequirePermissions } from '../../core/decorators/permissions.decorator.js';
import { PermissionService } from './permission.service.js';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @RequirePermissions(PermissionCode.PERMISSIONS)
  async findAll() {
    return this.permissionService.findAll();
  }

  @Get(':code')
  @RequirePermissions(PermissionCode.PERMISSIONS)
  async findByCode(@Param('code') code: PermissionCode) {
    return this.permissionService.findByCode(code);
  }
}
