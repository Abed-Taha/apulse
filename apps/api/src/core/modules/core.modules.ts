import { Module } from '@nestjs/common';
import { RoleModule } from '../../modules/role/role.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { UserModule } from '../../modules/user/user.module.js';

@Module({
  imports: [DatabaseModule, UserModule, RoleModule],
})
export class CoreModules {}
