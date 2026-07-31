import { CookieOptions } from 'express';
import { parseDurationMs } from '../../../common/utils/duration.utils';

export const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/auth';

export function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: parseDurationMs(process.env.JWT_REFRESH_EXPIRATION ?? '7d'),
  };
}

export function clearedRefreshCookieOptions(): CookieOptions {
  return {
    ...refreshCookieOptions(),
    maxAge: 0,
  };
}

export function isWebClient(clientType?: string): boolean {
  return clientType === 'web';
}
