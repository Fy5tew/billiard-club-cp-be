import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

import { UploadFileDto } from '@app/shared/dtos/storage.dto';

export type BilliardTableId = string;
export type BilliardTablePhotoId = string;

export enum BilliardTableType {
  POOL = 'POOL',
  SNOOKER = 'SNOOKER',
  RUSSIAN_BILLIARDS = 'RUSSIAN_BILLIARDS',
  CAROM = 'CAROM',
  ENGLISH_BILLIARDS = 'ENGLISH_BILLIARDS',
}

export enum BilliardTableStatus {
  Available = 'Available',
  Blocked = 'Blocked',
  Maintenance = 'Maintenance',
}

export class BilliardTablePhotoDto {
  @ApiProperty()
  @Expose()
  id: BilliardTablePhotoId;

  @ApiProperty()
  @Expose()
  @IsUrl()
  photoUrl: string;

  @ApiProperty()
  @Expose()
  @IsString()
  photoFilename: string;
}

export class BilliardTableDto {
  @ApiProperty()
  @Expose()
  id: BilliardTableId;

  @ApiProperty()
  @Expose()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @Expose()
  @IsNumber()
  @Min(0)
  hourlyPrice: number;

  @ApiProperty({ enum: BilliardTableType })
  @Expose()
  @IsEnum(BilliardTableType)
  type: BilliardTableType;

  @ApiProperty({ enum: BilliardTableStatus })
  @Expose()
  @IsEnum(BilliardTableStatus)
  status: BilliardTableStatus;

  @ApiProperty({ type: [BilliardTablePhotoDto] })
  @Expose()
  photos: BilliardTablePhotoDto[];
}

export class CreateBilliardTableDto extends OmitType(BilliardTableDto, [
  'id',
  'photos',
  'status',
]) {
  @ApiProperty({ type: 'string', isArray: true })
  @IsOptional()
  photoFilenames?: string[];
}

export class UpdateBilliardTableDto extends PickType(BilliardTableDto, [
  'title',
  'description',
  'hourlyPrice',
  'type',
  'status',
]) {}

export class CreateBilliardTablePhotoDto extends OmitType(UploadFileDto, [
  'bucket',
]) {}

export class UpdateBilliardTablePhotosDto {
  @ApiProperty({ type: 'string', isArray: true })
  @IsOptional()
  photoIdsToDelete?: BilliardTablePhotoId[];
}
