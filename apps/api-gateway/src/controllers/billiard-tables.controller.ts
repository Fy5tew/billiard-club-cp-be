import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFiles,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common/decorators/core/use-interceptors.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import type { BilliardTableId } from '@app/shared/dtos/billiard-table.dto';
import {
  BilliardTableDto,
  CreateBilliardTableDto,
  UpdateBilliardTableDto,
  UpdateBilliardTablePhotosDto,
  UpdateBilliardTableStatusDto,
} from '@app/shared/dtos/billiard-table.dto';
import { UserRole } from '@app/shared/dtos/user.dto';
import { BilliardTablesClient } from '@app/shared/services/billiard-tables/billiard-tables.client';

import { PublicRoute, RoleAccess } from '../auth/auth.decorators';
import { BilliardTablesRoute } from '../constants/billiard-tables.constants';

@Controller(BilliardTablesRoute.BASE)
export class BilliardTablesController {
  constructor(private readonly billiardTablesClient: BilliardTablesClient) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new billiard table' })
  @ApiBody({ description: 'Billiard table data', type: CreateBilliardTableDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Created billiard table successfully',
    type: BilliardTableDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token not provided or expired',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Billiard table with this title already exists',
  })
  @RoleAccess(UserRole.Admin)
  @Post()
  async create(
    @Body() data: CreateBilliardTableDto,
  ): Promise<BilliardTableDto> {
    return this.billiardTablesClient.create(data);
  }

  @ApiOperation({ summary: 'Get all billiard tables' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieved all billiard tables successfully',
    type: [BilliardTableDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token not provided or expired',
  })
  @PublicRoute()
  @Get()
  async getTables(): Promise<BilliardTableDto[]> {
    return this.billiardTablesClient.getTables();
  }

  @ApiOperation({ summary: 'Get billiard table by ID' })
  @ApiParam({ name: 'id', description: 'Billiard table ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieved billiard table successfully',
    type: BilliardTableDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token not provided or expired',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Billiard table was not found',
  })
  @PublicRoute()
  @Get(BilliardTablesRoute.TABLE)
  async getById(
    @Param('id', ParseUUIDPipe) id: BilliardTableId,
  ): Promise<BilliardTableDto> {
    return this.billiardTablesClient.getById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update billiard table' })
  @ApiParam({ name: 'id', description: 'Billiard table ID' })
  @ApiBody({
    description: 'Billiard table data to update',
    type: UpdateBilliardTableDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated billiard table successfully',
    type: BilliardTableDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token not provided or expired',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Billiard table was not found',
  })
  @RoleAccess(UserRole.Admin)
  @Put(BilliardTablesRoute.TABLE)
  async updateById(
    @Param('id', ParseUUIDPipe) id: BilliardTableId,
    @Body() data: UpdateBilliardTableDto,
  ): Promise<BilliardTableDto> {
    return this.billiardTablesClient.updateById(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update billiard table status' })
  @ApiParam({ name: 'id', description: 'Billiard table ID' })
  @ApiBody({
    description: 'Billiard table data to update',
    type: UpdateBilliardTableStatusDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated billiard table successfully',
    type: BilliardTableDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token not provided or expired',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Billiard table was not found',
  })
  @RoleAccess(UserRole.Manager)
  @Put(BilliardTablesRoute.TABLE_STATUS)
  async updateStatusById(
    @Param('id', ParseUUIDPipe) id: BilliardTableId,
    @Body() data: UpdateBilliardTableStatusDto,
  ): Promise<BilliardTableDto> {
    return this.billiardTablesClient.updateById(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add photos to billiard table' })
  @ApiParam({ name: 'id', description: 'Billiard table ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload photos for billiard table',
    schema: {
      type: 'object',
      properties: {
        photos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Added photos to billiard table successfully',
    type: BilliardTableDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token not provided or expired',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Billiard table was not found',
  })
  @RoleAccess(UserRole.Admin)
  @UseInterceptors(FilesInterceptor('photos', 10))
  @Post(BilliardTablesRoute.PHOTOS)
  async addPhotos(
    @Param('id', ParseUUIDPipe) id: BilliardTableId,
    @UploadedFiles() photos: Express.Multer.File[],
  ): Promise<BilliardTableDto> {
    if (!photos || photos.length === 0) {
      throw new BadRequestException('At least one photo must be provided');
    }

    const photosData = photos.map((photo) => ({
      filename: photo.originalname,
      buffer: photo.buffer,
      mimeType: photo.mimetype,
    }));

    return this.billiardTablesClient.addPhotos(id, photosData);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update photos of billiard table' })
  @ApiParam({ name: 'id', description: 'Billiard table ID' })
  @ApiBody({
    description: 'Photos update data',
    type: UpdateBilliardTablePhotosDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated photos successfully',
    type: BilliardTableDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token not provided or expired',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Billiard table was not found',
  })
  @RoleAccess(UserRole.Admin)
  @Put(BilliardTablesRoute.PHOTOS)
  async updatePhotos(
    @Param('id', ParseUUIDPipe) id: BilliardTableId,
    @Body() updateData: UpdateBilliardTablePhotosDto,
  ): Promise<BilliardTableDto> {
    return this.billiardTablesClient.updatePhotos(id, updateData);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete billiard table' })
  @ApiParam({ name: 'id', description: 'Billiard table ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deleted billiard table successfully',
    type: BilliardTableDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token not provided or expired',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Billiard table was not found',
  })
  @RoleAccess(UserRole.Admin)
  @Delete(BilliardTablesRoute.TABLE)
  async deleteById(
    @Param('id', ParseUUIDPipe) id: BilliardTableId,
  ): Promise<BilliardTableDto> {
    return this.billiardTablesClient.deleteById(id);
  }
}
