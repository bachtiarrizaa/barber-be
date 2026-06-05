import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { UserRepository } from '../../users/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

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

    const tokens = this.generateTokens(user);

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
      permissions: permissionTree,
    };
  }

  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    const decodedAccess = this.jwtService.decode<JwtPayload>(accessToken);
    if (decodedAccess?.exp) {
      const ttl = decodedAccess.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.tokenBlacklistService.blacklist(accessToken, ttl);
      }
    }

    if (refreshToken) {
      const decodedRefresh = this.jwtService.decode<JwtPayload>(refreshToken);
      if (decodedRefresh?.exp) {
        const ttl = decodedRefresh.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.tokenBlacklistService.blacklist(refreshToken, ttl);
        }
      }
    }
  }

  async refreshToken(userId: string): Promise<AuthTokens> {
    const user = await this.userRepository.findOne(
      { id: userId },
      { populate: ['role'] },
    );

    if (!user || !user.isActive)
      throw new UnauthorizedException('Access denied');

    return this.generateTokens(user);
  }

  private generateTokens(user: ITokenUser): AuthTokens {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
