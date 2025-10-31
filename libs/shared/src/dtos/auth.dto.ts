import { PickType } from '@nestjs/mapped-types';

import { CreateUserDto } from './user.dto';

export class LoginDto extends PickType(CreateUserDto, ['email', 'password']) {}

export class AccessTokenDto {
  accessToken: string;
}

export class TokensDto extends AccessTokenDto {
  refreshToken: string;
}
