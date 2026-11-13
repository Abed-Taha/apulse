import { createHash, randomBytes } from 'node:crypto';

/**
 * Generate a cryptographically secure random refresh token (128 hex chars = 64 bytes entropy).
 */
export function generateRefreshToken(): string {
  return randomBytes(64).toString('hex');
}

/**
 * Hash a raw refresh token using SHA-256.
 * We use a plain SHA-256 (not HMAC) since the raw token already has 64 bytes of entropy.
 */
export function hashRefreshToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Parse a duration string like "1h", "7d", "30m" into milliseconds.
 */
export function parseDurationMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }
  const value = parseInt(match[1], 10);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`Invalid duration value: ${duration}`);
  }
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * multipliers[unit];
}

export function isRefreshTokenFormat(token: unknown): token is string {
  return typeof token === 'string' && /^[a-f0-9]{128}$/.test(token);
}
