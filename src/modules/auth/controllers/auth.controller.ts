import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthTokens, LoginResponse } from '../interfaces/auth-tokens.interface';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { LoginDto } from '../dtos/login.dto';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login successful')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Logout successful')
  async logout(
    @Headers('authorization') auth: string,
    @Body('refreshToken') refreshToken?: string,
  ): Promise<void> {
    const token = auth.replace('Bearer ', '');
    return this.authService.logout(token, refreshToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ResponseMessage('Token refreshed successfully')
  async refresh(@CurrentUser() user: JwtPayload): Promise<AuthTokens> {
    return this.authService.refreshToken(user.sub);
  }
}
