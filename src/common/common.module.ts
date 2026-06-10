import { Module } from '@nestjs/common';
import { RedisProvider } from './providers/redis.provider';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { FileService } from './services/file.service';

@Module({
  providers: [FileService, RedisProvider, TokenBlacklistService],
  exports: [FileService, RedisProvider, TokenBlacklistService],
})
export class CommonModule {}
