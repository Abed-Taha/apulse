import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  type AuthenticatedUser,
  type PermissionCode,
  RoleCode,
} from '@apulse/shared';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionCode[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
    }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    // Super Admin role bypasses domain permission restrictions
    if (user.roleCode === RoleCode.SUPER_ADMIN) {
      return true;
    }

    const userPermissions = user.permissions ?? [];
    const hasPermission = requiredPermissions.some((required) =>
      userPermissions.includes(required),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient domain permissions. Required: [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
