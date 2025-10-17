import { OmitType, PickType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserDto {
  id: string;

  @IsEmail()
  email: string;

  name: string;

  surname: string;
}

export class CreateUserDto extends OmitType(UserDto, ['id']) {
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto extends PickType(UserDto, [
  'id',
  'name',
  'surname',
]) {}
