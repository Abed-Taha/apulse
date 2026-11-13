import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, IsNull } from 'typeorm';
import { createHash, pbkdf2Sync, timingSafeEqual } from 'node:crypto';

import { UserService } from '../user/user.service.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import {
  generateRefreshToken,
  hashRefreshToken,
  parseDurationMs,
} from './utils/token.utils.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly refreshTokenExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {
    this.refreshTokenExpiresIn =
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') ?? '1h';
  }

  // ─── Password Verification ───────────────────────────────────────────────

  /**
   * Verify a plaintext password against a stored hash.
   * Supports two schemes:
   *  1. PBKDF2: when `saltPass` is present (format: "iterations:salt:hash")
   *  2. SHA-256: direct hash comparison fallback for seeded/legacy users
   */
  private verifyPassword(
    plaintext: string,
    storedHash: string,
    saltPass: string | null,
  ): boolean {
    if (saltPass) {
      // PBKDF2 scheme: "iterations:salt:derivedHex"
      const parts = saltPass.split(':');
      if (parts.length === 3) {
        const [iterStr, salt, expected] = parts;
        const iterations = parseInt(iterStr, 10);
        const derived = pbkdf2Sync(
          plaintext,
          salt,
          iterations,
          64,
          'sha512',
        ).toString('hex');
        try {
          return timingSafeEqual(
            Buffer.from(derived, 'hex'),
            Buffer.from(expected, 'hex'),
          );
        } catch {
          return false;
        }
      }
    }

    // SHA-256 fallback (legacy seeded users)
    const inputHash = createHash('sha256').update(plaintext).digest('hex');
    try {
      return timingSafeEqual(
        Buffer.from(inputHash, 'hex'),
        Buffer.from(storedHash, 'hex'),
      );
    } catch {
      return false;
    }
  }

  // ─── Token Helpers ───────────────────────────────────────────────────────

  private signAccessToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }

  private async createRefreshToken(
    userId: string,
    deviceInfo?: string,
  ): Promise<string> {
    const rawToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawToken);
    const expiresMs = parseDurationMs(this.refreshTokenExpiresIn);

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + expiresMs),
      deviceInfo: deviceInfo ?? null,
    });

    await this.refreshTokenRepository.save(refreshToken);
    return rawToken;
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Authenticate user credentials and issue a token pair.
   */
  async login(
    email: string,
    password: string,
    deviceInfo?: string,
  ): Promise<TokenPair> {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.userService.findByEmailForAuth(email);

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = this.verifyPassword(password, user.password, user.saltPass);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.userService.updateLastLogin(user.id);

    const [accessToken, refreshToken] = await Promise.all([
      Promise.resolve(this.signAccessToken(user.id)),
      this.createRefreshToken(user.id, deviceInfo),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Rotate a refresh token: validate, revoke old, issue new pair.
   */
  async refresh(rawRefreshToken: string): Promise<TokenPair> {
    if (!rawRefreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const tokenHash = hashRefreshToken(rawRefreshToken);

    const record = await this.refreshTokenRepository.findOne({
      where: { tokenHash, revokedAt: IsNull() },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    if (record.expiresAt < new Date()) {
      // Clean up expired token
      await this.refreshTokenRepository.update(record.id, {
        revokedAt: new Date(),
      });
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Revoke the used token (rotation)
    await this.refreshTokenRepository.update(record.id, {
      revokedAt: new Date(),
    });

    const [accessToken, refreshToken] = await Promise.all([
      Promise.resolve(this.signAccessToken(record.userId)),
      this.createRefreshToken(record.userId, record.deviceInfo ?? undefined),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Revoke a single refresh token (logout current session).
   */
  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(rawRefreshToken);

    const record = await this.refreshTokenRepository.findOne({
      where: { tokenHash, revokedAt: IsNull() },
    });

    if (!record) {
      throw new BadRequestException('Token not found or already revoked');
    }

    await this.refreshTokenRepository.update(record.id, {
      revokedAt: new Date(),
    });
  }

  /**
   * Revoke all active refresh tokens for a user (logout all sessions).
   */
  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('revoked_at IS NULL')
      .execute();
  }
}
