import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  @Get('')
  @Roles('admin')
  async getName() {
    return 'hi';
  }
}
