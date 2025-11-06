import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export type UserId = string;

export class UserDto {
  @ApiProperty()
  @Expose()
  id: UserId;

  @ApiProperty()
  @Expose()
  @IsEmail()
  email: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  surname: string;
}

export class CreateUserDto extends OmitType(UserDto, ['id']) {
  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto extends PickType(UserDto, ['name', 'surname']) {}
