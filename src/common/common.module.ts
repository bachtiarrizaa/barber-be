import { Module } from '@nestjs/common';
import { RedisProvider } from './providers/redis.provider';
import { TokenBlacklistService } from './services/token-blacklist.service';

@Module({
  providers: [RedisProvider, TokenBlacklistService],
  exports: [TokenBlacklistService],
})
export class CommonModule {}
