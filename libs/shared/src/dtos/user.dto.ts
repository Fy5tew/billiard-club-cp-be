import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUrl,
} from 'class-validator';

import { UploadFileDto } from './storage.dto';

export type UserId = string;

export enum UserStatus {
  Pending,
  Active,
  Blocked,
}

export enum UserRole {
  User,
  Manager,
  Admin,
}

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

  @ApiProperty({ enum: UserRole })
  @Expose()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  @Expose()
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class CreateUserDto extends OmitType(UserDto, [
  'id',
  'photoUrl',
  'role',
  'status',
]) {
  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto extends PartialType(
  PickType(UserDto, ['name', 'surname', 'role', 'status']),
) {}

export class UpdateUserProfileDto extends PartialType(
  PickType(UpdateUserDto, ['name', 'surname']),
) {}

export class UpdateUserPhotoDto extends OmitType(UploadFileDto, ['bucket']) {}
