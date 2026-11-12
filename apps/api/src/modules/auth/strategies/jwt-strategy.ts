import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { UserService } from '../../user/user.service.js';
import type { AuthenticatedUser, PermissionCode } from '@apulse/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: { sub: string }): Promise<AuthenticatedUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userService.findActiveById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const permissions: PermissionCode[] =
      user.role?.permissions?.map((p) => p.code as PermissionCode) ?? [];

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleId: user.roleId,
      roleCode: user.role.code,
      permissions,
    };
  }
}
