import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity.js';
import { UserPermission } from './entities/user-permission.entity.js';
import { PermissionsSeed } from './seeds/permissions.seed.js';
import { PermissionService } from './permission.service.js';
import { PermissionController } from './permission.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, UserPermission])],
  controllers: [PermissionController],
  providers: [PermissionsSeed, PermissionService],
  exports: [TypeOrmModule, PermissionService, PermissionsSeed],
})
export class PermissionModule {}
