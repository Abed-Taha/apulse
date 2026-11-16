import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService, TokenPair } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { Public } from '../../core/decorators/public.decorator.js';
import type { AuthenticatedUser } from '@apulse/shared';
import { RegisterDto } from './dto/register.dto.js';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Authenticate with email + password and receive a token pair.
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and returns an access token and refresh token.',
  })
  @ApiCreatedResponse({
    description: 'User successfully registered.',
    type: Promise<TokenPair>,
  })
  @ApiBadRequestResponse({
    description: 'Invalid registration payload.',
  })
  @ApiConflictResponse({
    description: 'An account with this email address already exists.',
  })
  async register(@Body() registerPayload: RegisterDto): Promise<TokenPair> {
    return this.authService.register(registerPayload);
  }
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password, dto.deviceInfo);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  getCurrentUser(
    @Request() req: { user: AuthenticatedUser },
  ): AuthenticatedUser {
    return req.user;
  }

  /**
   * POST /auth/refresh
   * Exchange a valid refresh token for a new token pair (rotation).
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  /**
   * POST /auth/logout
   * Revoke the current session's refresh token.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto.refreshToken);
  }

  /**
   * POST /auth/logout-all
   * Revoke all active sessions for the authenticated user.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(@Request() req: { user: AuthenticatedUser }) {
    await this.authService.logoutAll(req.user.id);
  }
}
