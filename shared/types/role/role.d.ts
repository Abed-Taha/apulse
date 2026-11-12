import type { Permission } from '../permission/permission.js';

export declare const RoleCode: {
  readonly SUPER_ADMIN: 'super_admin';
  readonly ADMIN: 'admin';
  readonly SALES_MANAGER: 'sales_manager';
  readonly EMPLOYEE: 'employee';
  readonly CUSTOMER: 'customer';
  readonly LEAD: 'leads';
};

export type RoleCode = (typeof RoleCode)[keyof typeof RoleCode];

export interface Role {
  id: string;
  name: string;
  code: RoleCode;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  permissions?: Permission[];
}

export type DefaultRole = Pick<Role, 'name' | 'code' | 'description'>;

export declare const DEFAULT_ROLES: readonly DefaultRole[];
