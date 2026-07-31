import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthTokens, LoginResponse } from '../interfaces/auth-tokens.interface';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { LoginDto } from '../dtos/login.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  clearedRefreshCookieOptions,
  isWebClient,
} from '../constants/refresh-cookie.constant';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successful')
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-client-type') clientType: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const result = await this.authService.login(loginDto);

    if (isWebClient(clientType)) {
      res.cookie(
        REFRESH_COOKIE_NAME,
        result.refreshToken,
        refreshCookieOptions(),
      );
      return { ...result, refreshToken: undefined };
    }

    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Token refreshed successfully')
  async refresh(
    @Headers('x-client-type') clientType: string,
    @Body('refreshToken') bodyRefreshToken: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens> {
    const web = isWebClient(clientType);
    const rawRefreshToken = web
      ? (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined)
      : bodyRefreshToken;

    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const result = await this.authService.refreshToken(rawRefreshToken);

    if (web) {
      res.cookie(
        REFRESH_COOKIE_NAME,
        result.refreshToken,
        refreshCookieOptions(),
      );
      return { ...result, refreshToken: undefined };
    }

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Logout successful')
  async logout(
    @Headers('authorization') auth: string,
    @Headers('x-client-type') clientType: string,
    @Body('refreshToken') bodyRefreshToken: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = auth.replace('Bearer ', '');
    const web = isWebClient(clientType);
    const rawRefreshToken = web
      ? (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined)
      : bodyRefreshToken;

    await this.authService.logout(token, rawRefreshToken);

    if (web) {
      res.cookie(REFRESH_COOKIE_NAME, '', clearedRefreshCookieOptions());
    }
  }
}
