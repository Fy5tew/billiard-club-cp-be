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
  ApiTags,
} from '@nestjs/swagger';

import type { BilliardTableId } from '@app/shared/dtos/billiard-table.dto';
import {
  BilliardTableDto,
  CreateBilliardTableDto,
  UpdateBilliardTableDto,
  UpdateBilliardTablePhotosDto,
  BilliardTableStatus,
} from '@app/shared/dtos/billiard-table.dto';
import { UserRole } from '@app/shared/dtos/user.dto';
import { BilliardTablesClient } from '@app/shared/services/billiard-tables/billiard-tables.client';

import { PublicRoute, RoleAccess } from '../auth/auth.decorators';
import { BilliardTablesRoute } from '../constants/billiard-tables.constants';

@ApiTags('Billiard Tables')
@ApiBearerAuth()
@Controller(BilliardTablesRoute.BASE)
export class ApiGatewayBilliardTablesController {
  constructor(private readonly billiardTablesClient: BilliardTablesClient) {}

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
  @RoleAccess(UserRole.Manager)
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
  @Get()
  async getAll(): Promise<BilliardTableDto[]> {
    return this.billiardTablesClient.getAll();
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
  @RoleAccess(UserRole.Manager)
  @Put(BilliardTablesRoute.TABLE)
  async updateById(
    @Param('id', ParseUUIDPipe) id: BilliardTableId,
    @Body() data: UpdateBilliardTableDto,
  ): Promise<BilliardTableDto> {
    return this.billiardTablesClient.updateById(id, data);
  }

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
  @RoleAccess(UserRole.Manager)
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
  @RoleAccess(UserRole.Manager)
  @Put(BilliardTablesRoute.PHOTOS)
  async updatePhotos(
    @Param('id', ParseUUIDPipe) id: BilliardTableId,
    @Body() updateData: UpdateBilliardTablePhotosDto,
  ): Promise<BilliardTableDto> {
    return this.billiardTablesClient.updatePhotos(id, updateData);
  }

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

  @ApiOperation({ summary: 'Block billiard table' })
  @ApiParam({ name: 'id', description: 'Billiard table ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blocked billiard table successfully',
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
  @Post(':id/block')
  async blockTable(
    @Param('id', ParseUUIDPipe) id: BilliardTableId,
  ): Promise<BilliardTableDto> {
    // @ts-expect-error temp
    const updateData: UpdateBilliardTableDto = {
      status: BilliardTableStatus.Blocked,
    };
    return this.billiardTablesClient.updateById(id, updateData);
  }

  @ApiOperation({ summary: 'Unblock billiard table' })
  @ApiParam({ name: 'id', description: 'Billiard table ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Unblocked billiard table successfully',
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
  @Post(':id/unblock')
  async unblockTable(
    @Param('id', ParseUUIDPipe) id: BilliardTableId,
  ): Promise<BilliardTableDto> {
    // @ts-expect-error temp
    const updateData: UpdateBilliardTableDto = {
      status: BilliardTableStatus.Available,
    };
    return this.billiardTablesClient.updateById(id, updateData);
  }

  @ApiOperation({ summary: 'Set table for maintenance' })
  @ApiParam({ name: 'id', description: 'Billiard table ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Set table for maintenance successfully',
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
  @Post(':id/maintenance')
  async setTableForMaintenance(
    @Param('id', ParseUUIDPipe) id: BilliardTableId,
  ): Promise<BilliardTableDto> {
    // @ts-expect-error temp
    const updateData: UpdateBilliardTableDto = {
      status: BilliardTableStatus.Maintenance,
    };
    return this.billiardTablesClient.updateById(id, updateData);
  }

  @ApiOperation({ summary: 'Get available tables' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieved available billiard tables successfully',
    type: [BilliardTableDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token not provided or expired',
  })
  @Get('available')
  async getAvailableTables(): Promise<BilliardTableDto[]> {
    const allTables = await this.billiardTablesClient.getAll();
    return allTables.filter(
      (table) => table.status === BilliardTableStatus.Available,
    );
  }
}
