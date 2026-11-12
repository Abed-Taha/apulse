import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import type {
  Permission as SharedPermission,
  PermissionCode,
} from '@apulse/shared';
import { Role } from '../../role/entities/role.entity.js';

@Entity('permissions')
export class Permission implements SharedPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: PermissionCode;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles?: Role[];
}
