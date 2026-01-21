import { Request } from 'express';

import { UserDto, UserId } from '../dtos/user.dto';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  ACTIVATION = 'activation',
}

export type AccessTokenPayload = {
  tokenType: TokenType.ACCESS;
  user: UserDto;
};

export type RefreshTokenPayload = {
  tokenType: TokenType.REFRESH;
  userId: UserId;
};

export type ActivationTokenPayload = {
  tokenType: TokenType.ACTIVATION;
  userId: UserId;
};

export type RequestWithUserId = Request & {
  user: { userId: UserId };
};

export type RequestWithUser = Request & {
  user: UserDto;
};
