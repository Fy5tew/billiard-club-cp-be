import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  CreateNewsDto,
  GetManageNewsQueryDto,
  GetPublicNewsQueryDto,
  NewsDto,
  UpdateNewsDto,
  UpdateNewsStatusDto,
} from '@app/shared/dtos/news.dto';
import type { NewsId } from '@app/shared/dtos/news.dto';
import { UserRole } from '@app/shared/dtos/user.dto';
import { NewsClient } from '@app/shared/services/news/news.client';
import type { RequestWithUser } from '@app/shared/types/auth.types';
import type { UploadedFilePayload } from '@app/shared/types/request.types';

import { PublicRoute, RoleAccess } from '../auth/auth.decorators';
import { NewsRoute } from '../constants/news.constants';

@ApiTags('News')
@Controller(NewsRoute.BASE)
export class NewsController {
  constructor(private readonly newsClient: NewsClient) {}

  @ApiOperation({ summary: 'Get published news list' })
  @ApiResponse({ status: HttpStatus.OK, type: [NewsDto] })
  @PublicRoute()
  @Get()
  async getPublicList(
    @Query() query: GetPublicNewsQueryDto,
  ): Promise<NewsDto[]> {
    return this.newsClient.getPublicList(query);
  }

  @ApiOperation({ summary: 'Get published news tags' })
  @ApiResponse({ status: HttpStatus.OK, type: [String] })
  @PublicRoute()
  @Get(NewsRoute.TAGS)
  async getPublicTags(): Promise<string[]> {
    return this.newsClient.getPublicTags();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all news for management' })
  @ApiResponse({ status: HttpStatus.OK, type: [NewsDto] })
  @RoleAccess(UserRole.Manager)
  @Get(NewsRoute.MANAGE)
  async getManageList(
    @Query() query: GetManageNewsQueryDto,
  ): Promise<NewsDto[]> {
    return this.newsClient.getManageList(query);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all news tags for management' })
  @ApiResponse({ status: HttpStatus.OK, type: [String] })
  @RoleAccess(UserRole.Manager)
  @Get(NewsRoute.MANAGE_TAGS)
  async getManageTags(): Promise<string[]> {
    return this.newsClient.getManageTags();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create news' })
  @ApiBody({ type: CreateNewsDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: NewsDto })
  @RoleAccess(UserRole.Manager)
  @Post(NewsRoute.MANAGE)
  async create(
    @Req() { user }: RequestWithUser,
    @Body() data: CreateNewsDto,
  ): Promise<NewsDto> {
    return this.newsClient.create(user.id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get news by ID for management' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: NewsDto })
  @RoleAccess(UserRole.Manager)
  @Get(NewsRoute.MANAGE_NEWS)
  async getManageById(
    @Param('id', ParseUUIDPipe) id: NewsId,
  ): Promise<NewsDto> {
    return this.newsClient.getManageById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update news by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateNewsDto })
  @ApiResponse({ status: HttpStatus.OK, type: NewsDto })
  @RoleAccess(UserRole.Manager)
  @Patch(NewsRoute.MANAGE_NEWS)
  async updateById(
    @Param('id', ParseUUIDPipe) id: NewsId,
    @Body() data: UpdateNewsDto,
  ): Promise<NewsDto> {
    return this.newsClient.updateById(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete news by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: NewsDto })
  @RoleAccess(UserRole.Manager)
  @Delete(NewsRoute.MANAGE_NEWS)
  async deleteById(@Param('id', ParseUUIDPipe) id: NewsId): Promise<NewsDto> {
    return this.newsClient.deleteById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update news status by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateNewsStatusDto })
  @ApiResponse({ status: HttpStatus.OK, type: NewsDto })
  @RoleAccess(UserRole.Manager)
  @Patch(NewsRoute.MANAGE_STATUS)
  async updateStatusById(
    @Param('id', ParseUUIDPipe) id: NewsId,
    @Body() data: UpdateNewsStatusDto,
  ): Promise<NewsDto> {
    return this.newsClient.updateStatusById(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update news cover image by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, type: NewsDto })
  @RoleAccess(UserRole.Manager)
  @UseInterceptors(FileInterceptor('file'))
  @Post(NewsRoute.MANAGE_COVER)
  async updateCoverById(
    @Param('id', ParseUUIDPipe) id: NewsId,
    @UploadedFile() file: UploadedFilePayload,
  ): Promise<NewsDto> {
    if (!file) {
      throw new BadRequestException('File not found in request');
    }

    return this.newsClient.updateCoverById(id, {
      filename: file.originalname,
      buffer: file.buffer,
      mimeType: file.mimetype,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete news cover image by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: NewsDto })
  @RoleAccess(UserRole.Manager)
  @Delete(NewsRoute.MANAGE_COVER)
  async deleteCoverById(
    @Param('id', ParseUUIDPipe) id: NewsId,
  ): Promise<NewsDto> {
    return this.newsClient.deleteCoverById(id);
  }

  @ApiOperation({ summary: 'Get published news by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: NewsDto })
  @PublicRoute()
  @Get(NewsRoute.NEWS)
  async getPublicById(
    @Param('id', ParseUUIDPipe) id: NewsId,
  ): Promise<NewsDto> {
    return this.newsClient.getPublicById(id);
  }
}
