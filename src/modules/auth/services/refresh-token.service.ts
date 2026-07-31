import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '../../../common/providers/redis.provider';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import { parseDurationSeconds } from '../../../common/utils/duration.utils';

interface StoredToken {
  userId: string;
  secretHash: string;
  status: 'active' | 'used';
}

const REUSE_GRACE_SECONDS = 30;

export class InvalidRefreshTokenError extends Error {}
export class ReuseDetectedError extends Error {}

@Injectable()
export class RefreshTokenService {
  private readonly ttlSeconds: number;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
    this.ttlSeconds = parseDurationSeconds(
      process.env.JWT_REFRESH_EXPIRATION ?? '7d',
    );
  }

  private hash(secret: string): string {
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  private tokenKey(tokenId: string) {
    return `rt:${tokenId}`;
  }

  private userSetKey(userId: string) {
    return `rtuser:${userId}`;
  }

  private parseStoredToken(raw: string): StoredToken | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'userId' in parsed &&
      'secretHash' in parsed &&
      'status' in parsed &&
      typeof (parsed as StoredToken).userId === 'string' &&
      typeof (parsed as StoredToken).secretHash === 'string' &&
      ((parsed as StoredToken).status === 'active' ||
        (parsed as StoredToken).status === 'used')
    ) {
      return parsed as StoredToken;
    }

    return null;
  }

  async create(userId: string): Promise<string> {
    const tokenId = crypto.randomBytes(16).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');

    const payload: StoredToken = {
      userId,
      secretHash: this.hash(secret),
      status: 'active',
    };

    await this.redis.set(
      this.tokenKey(tokenId),
      JSON.stringify(payload),
      'EX',
      this.ttlSeconds,
    );
    await this.redis.sadd(this.userSetKey(userId), tokenId);
    await this.redis.expire(this.userSetKey(userId), this.ttlSeconds);

    return `${tokenId}.${secret}`;
  }

  async rotate(
    rawToken: string,
  ): Promise<{ userId: string; newToken: string }> {
    const [tokenId, secret] = rawToken.split('.');
    if (!tokenId || !secret) throw new InvalidRefreshTokenError();

    const raw = await this.redis.get(this.tokenKey(tokenId));
    if (!raw) throw new InvalidRefreshTokenError();

    const stored = this.parseStoredToken(raw);
    if (!stored) throw new InvalidRefreshTokenError();

    if (stored.status === 'used') {
      await this.revokeAllForUser(stored.userId);
      throw new ReuseDetectedError();
    }

    if (stored.secretHash !== this.hash(secret)) {
      throw new InvalidRefreshTokenError();
    }

    const usedPayload: StoredToken = { ...stored, status: 'used' };
    await this.redis.set(
      this.tokenKey(tokenId),
      JSON.stringify(usedPayload),
      'EX',
      REUSE_GRACE_SECONDS,
    );

    const newToken = await this.create(stored.userId);
    return { userId: stored.userId, newToken };
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const tokenIds = await this.redis.smembers(this.userSetKey(userId));
    if (tokenIds.length) {
      await this.redis.del(...tokenIds.map((id) => this.tokenKey(id)));
    }
    await this.redis.del(this.userSetKey(userId));
  }

  async revoke(rawToken: string): Promise<void> {
    const [tokenId] = rawToken.split('.');
    if (!tokenId) return;
    await this.redis.del(this.tokenKey(tokenId));
  }
}
