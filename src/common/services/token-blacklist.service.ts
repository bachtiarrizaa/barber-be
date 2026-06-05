import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '../providers/redis.provider';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async blacklist(token: string, ttl: number): Promise<void> {
    await this.redis.set(`blacklist:${token}`, '1', 'EX', ttl);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:${token}`);
    return result !== null;
  }
}
