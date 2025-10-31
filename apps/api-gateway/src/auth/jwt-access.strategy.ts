import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@app/shared/config/config.service';
import { UserDto } from '@app/shared/dtos/user.dto';
import { AccessTokenPayload, TokenType } from '@app/shared/types/auth.types';

import { JWT_ACCESS_STRATEGY } from './auth.constants';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  JWT_ACCESS_STRATEGY,
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.JWT.SECRET,
    });
  }

  validate(payload: AccessTokenPayload): UserDto {
    if (payload.tokenType !== TokenType.ACCESS) {
      throw new UnauthorizedException('Invalid token type');
    }
    return payload.user;
  }
}
