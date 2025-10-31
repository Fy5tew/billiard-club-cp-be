import { OmitType, PickType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty } from 'class-validator';

import { UserId } from '../types/user.types';

export class UserDto {
  id: UserId;

  @IsEmail()
  email: string;

  name: string;

  surname: string;
}

export class CreateUserDto extends OmitType(UserDto, ['id']) {
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto extends PickType(UserDto, ['name', 'surname']) {}
