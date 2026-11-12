import type { PermissionCode } from '../permission/permission.js';

export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  roleCode: string;
  permissions?: PermissionCode[];
}
