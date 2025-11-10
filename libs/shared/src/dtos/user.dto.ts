import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

import { UploadFileDto } from './storage.dto';

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

  @ApiProperty({ type: 'string', nullable: true })
  @Expose()
  @IsOptional()
  @IsUrl()
  photoUrl: string | null;
}

export class CreateUserDto extends OmitType(UserDto, ['id', 'photoUrl']) {
  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto extends PickType(UserDto, ['name', 'surname']) {}

export class UpdateUserPhotoDto extends OmitType(UploadFileDto, ['bucket']) {}
