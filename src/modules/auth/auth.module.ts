import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { JwtAccessStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommonModule } from '../../common/common.module';
import { RefreshTokenService } from './services/refresh-token.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    JwtModule.register({}),
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenService,
    JwtAccessStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, RolesGuard, JwtAuthGuard],
})
export class AuthModule {}
