import { OmitType, PickType } from '@nestjs/mapped-types';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

import type { UserId } from '../types/user.types';

export class UserDto {
  @Expose()
  id: UserId;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  name: string;

  @Expose()
  surname: string;
}

export class CreateUserDto extends OmitType(UserDto, ['id']) {
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto extends PickType(UserDto, ['name', 'surname']) {}
