import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { UserRepository } from '../../users/repositories/user.repository';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import {
  AuthTokens,
  LoginResponse,
  ParentPermission,
} from '../interfaces/auth-tokens.interface';
import { ITokenUser } from '../interfaces/token-user.interface';
import { TokenBlacklistService } from '../../../common/services/token-blacklist.service';
import {
  InvalidRefreshTokenError,
  ReuseDetectedError,
  RefreshTokenService,
} from './refresh-token.service';
import { parseDurationSeconds } from '../../../common/utils/duration.utils';

@Injectable()
export class AuthService {
  private readonly accessTokenTtlSeconds: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {
    this.accessTokenTtlSeconds = parseDurationSeconds(
      process.env.JWT_ACCESS_EXPIRATION ?? '15m',
    );
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.userRepository.findOne(
      { email: loginDto.email },
      { populate: ['role.permissions.parent'] },
    );

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is inactive');

    const passwordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);

    const permissions = user.role.permissions.getItems();
    const parentMap = new Map<string, ParentPermission>();

    for (const p of permissions) {
      if (p.parent) {
        const parentId = p.parent.id;
        if (!parentMap.has(parentId)) {
          parentMap.set(parentId, {
            id: p.parent.id,
            name: p.parent.name,
            children: [],
          });
        }
        parentMap.get(parentId)!.children.push({
          id: p.id,
          name: p.name,
          actionCode: p.actionCode!,
        });
      }
    }
    const permissionTree = Array.from(parentMap.values());

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role.id,
          name: user.role.name,
        },
      },
      permissions: permissionTree,
    };
  }

  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(accessToken, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      if (payload?.exp) {
        const ttl = payload.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.tokenBlacklistService.blacklist(accessToken, ttl);
        }
      }
    } catch {
      // Ignore invalid or expired token signature during logout
    }

    if (refreshToken) {
      await this.refreshTokenService.revoke(refreshToken);
    }
  }

  async refreshToken(rawRefreshToken: string): Promise<AuthTokens> {
    let rotated: { userId: string; newToken: string };
    try {
      rotated = await this.refreshTokenService.rotate(rawRefreshToken);
    } catch (err) {
      if (err instanceof ReuseDetectedError) {
        throw new UnauthorizedException(
          'Token reuse detected, all sessions revoked',
        );
      }
      if (err instanceof InvalidRefreshTokenError) {
        throw new UnauthorizedException('Refresh token invalid or expired');
      }
      throw err;
    }

    const user = await this.userRepository.findOne(
      { id: rotated.userId },
      { populate: ['role'] },
    );
    if (!user || !user.isActive)
      throw new UnauthorizedException('Access denied');

    const accessToken = this.signAccessToken(user);

    return {
      accessToken,
      refreshToken: rotated.newToken,
      expiresIn: this.accessTokenTtlSeconds,
    };
  }

  private signAccessToken(user: ITokenUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn:
        (process.env.JWT_ACCESS_EXPIRATION as JwtSignOptions['expiresIn']) ??
        '15m',
    });
  }

  private async generateTokens(user: ITokenUser): Promise<AuthTokens> {
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.refreshTokenService.create(user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenTtlSeconds,
    };
  }
}
