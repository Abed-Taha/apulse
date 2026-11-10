import { Module } from '@nestjs/common';
import { RoleService } from './role.service.js';
import { RoleController } from './role.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity.js';
import { RolesSeed } from './seeds/roles.seed.js';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RoleController],
  providers: [RoleService, RolesSeed],
  exports: [RoleService],
})
export class RoleModule {}
