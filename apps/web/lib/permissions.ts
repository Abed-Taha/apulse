import { type AuthenticatedUser, type PermissionCode, RoleCode } from '@apulse/shared';

/**
 * Checks whether an authenticated user has access to a specific domain or module.
 * Super Admin users bypass domain checks and have full module visibility.
 *
 * @param user The authenticated user or session
 * @param domain PermissionCode identifier for the domain/module
 */
export function canAccessDomain(
  user: AuthenticatedUser | null | undefined,
  domain: PermissionCode,
): boolean {
  if (!user) {
    return false;
  }

  if (user.roleCode === RoleCode.SUPER_ADMIN) {
    return true;
  }

  return Boolean(user.permissions?.includes(domain));
}

/**
 * Checks if a user has access to at least one of the specified domains.
 */
export function canAccessAnyDomain(
  user: AuthenticatedUser | null | undefined,
  domains: readonly PermissionCode[],
): boolean {
  if (!user) {
    return false;
  }

  if (user.roleCode === RoleCode.SUPER_ADMIN) {
    return true;
  }

  const userPermissions = user.permissions ?? [];
  return domains.some((domain) => userPermissions.includes(domain));
}

/**
 * Filters a list of UI tabs or navigation modules based on the user's domain permissions.
 */
export function filterVisibleModules<T extends { permission: PermissionCode }>(
  modules: readonly T[],
  user: AuthenticatedUser | null | undefined,
): T[] {
  return modules.filter((mod) => canAccessDomain(user, mod.permission));
}
