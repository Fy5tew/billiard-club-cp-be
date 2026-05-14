import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UploadFileDto } from './storage.dto';
import { NewsStatus } from '../entities/news.entity';

export type NewsId = string;

const parseTagsQueryValue = (value: unknown): string[] | undefined => {
  const values = Array.isArray(value) ? value : [value];
  const tags = values
    .filter((item): item is string => typeof item === 'string')
    .flatMap((item) => item.split(','))
    .map((item) => item.trim())
    .filter(Boolean);

  return tags.length ? tags : undefined;
};

export class CreateNewsDto {
  @ApiProperty({ example: 'Весенний турнир' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Краткое описание новости для карточки' })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  content: Record<string, unknown>;

  @ApiProperty({ type: 'string', isArray: true, example: ['турнир'] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

export class UpdateNewsDto extends PartialType(CreateNewsDto) {}

export class UpdateNewsStatusDto {
  @ApiProperty({ enum: NewsStatus, enumName: 'NewsStatus' })
  @IsEnum(NewsStatus)
  status: NewsStatus;
}

export class GetPublicNewsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ type: 'string', isArray: true })
  @IsOptional()
  @Transform(({ value }) => parseTagsQueryValue(value))
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class GetManageNewsQueryDto extends GetPublicNewsQueryDto {
  @ApiPropertyOptional({ enum: NewsStatus, enumName: 'NewsStatus' })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;
}

export class UpdateNewsCoverDto extends OmitType(UploadFileDto, ['bucket']) {}

export class NewsDto {
  @ApiProperty()
  @Expose()
  @IsUUID()
  id: NewsId;

  @ApiProperty()
  @Expose()
  @IsString()
  title: string;

  @ApiProperty()
  @Expose()
  @IsString()
  summary: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @Expose()
  content: Record<string, unknown>;

  @ApiProperty({ enum: NewsStatus, enumName: 'NewsStatus' })
  @Expose()
  @IsEnum(NewsStatus)
  status: NewsStatus;

  @ApiProperty({ type: 'string', isArray: true })
  @Expose()
  tags: string[];

  @ApiProperty({ nullable: true })
  @Expose()
  coverImageUrl: string | null;

  @ApiProperty()
  @Expose()
  authorId: string;

  @ApiProperty({ nullable: true })
  @Expose()
  @Type(() => Date)
  publishedAt: Date | null;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  updatedAt: Date;
}
