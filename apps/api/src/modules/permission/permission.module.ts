import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity.js';
import { UserPermission } from './entities/user-permission.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, UserPermission])],
})
export class PermissionModule {}
