import { ApiProperty, PickType } from '@nestjs/swagger';

import { CreateUserDto } from './user.dto';

export class LoginDto extends PickType(CreateUserDto, ['email', 'password']) {}

export class AccessTokenDto {
  @ApiProperty()
  accessToken: string;
}

export class TokensDto extends AccessTokenDto {
  refreshToken: string;
}

export class ActivationTokenDto {
  @ApiProperty()
  activationToken: string;
}
