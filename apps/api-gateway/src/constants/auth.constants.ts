import { CookieOptions } from 'express';

export enum AuthRoute {
  BASE = 'auth',
  REGISTER = 'register',
  LOGIN = 'login',
  REFRESH = 'refresh',
  LOGOUT = 'logout',
}

export const JWT_REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  // TODO: Enable after https setup
  // secure: true,
  sameSite: 'strict',
  path: '/',
};
