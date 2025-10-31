import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { ConfigService } from '@app/shared/config/config.service';
import { TokenType, RefreshTokenPayload } from '@app/shared/types/auth.types';
import { RequestWithCookies } from '@app/shared/types/request.types';

import {
  JWT_REFRESH_STRATEGY,
  JWT_REFRESH_TOKEN_COOKIE,
} from './auth.constants';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY,
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: JwtRefreshStrategy.extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: config.JWT.SECRET,
    });
  }

  private static extractJwtFromCookie(
    this: void,
    req: RequestWithCookies,
  ): string | null {
    return (req.cookies[JWT_REFRESH_TOKEN_COOKIE] as string) ?? null;
  }

  validate(payload: RefreshTokenPayload) {
    if (payload.tokenType !== TokenType.REFRESH) {
      throw new UnauthorizedException('Invalid token type');
    }
    return { userId: payload.userId };
  }
}
