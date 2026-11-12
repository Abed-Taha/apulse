import { SetMetadata } from '@nestjs/common';
import type { PermissionCode } from '@apulse/shared';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to enforce domain-level permission authorization on routes or controllers.
 * @param permissions List of domain permission codes (e.g., PermissionCode.USERS, PermissionCode.ORDERS)
 */
export const RequirePermissions = (...permissions: PermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
