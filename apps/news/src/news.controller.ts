import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  CreateNewsDto,
  GetManageNewsQueryDto,
  GetPublicNewsQueryDto,
  NewsDto,
  UpdateNewsCoverDto,
  UpdateNewsDto,
  UpdateNewsStatusDto,
} from '@app/shared/dtos/news.dto';
import type { NewsId } from '@app/shared/dtos/news.dto';
import type { UserId } from '@app/shared/dtos/user.dto';
import { NewsMessage } from '@app/shared/services/news/news.messages';

import { NewsService } from './news.service';

@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @MessagePattern(NewsMessage.CREATE)
  async create(
    @Payload() [authorId, data]: [UserId, CreateNewsDto],
  ): Promise<NewsDto> {
    return this.newsService.create(authorId, data);
  }

  @MessagePattern(NewsMessage.GET_PUBLIC_LIST)
  async getPublicList(
    @Payload() query: GetPublicNewsQueryDto,
  ): Promise<NewsDto[]> {
    return this.newsService.getPublicList(query);
  }

  @MessagePattern(NewsMessage.GET_PUBLIC_BY_ID)
  async getPublicById(@Payload() id: NewsId): Promise<NewsDto> {
    return this.newsService.getPublicById(id);
  }

  @MessagePattern(NewsMessage.GET_PUBLIC_TAGS)
  async getPublicTags(): Promise<string[]> {
    return this.newsService.getPublicTags();
  }

  @MessagePattern(NewsMessage.GET_MANAGE_LIST)
  async getManageList(
    @Payload() query: GetManageNewsQueryDto,
  ): Promise<NewsDto[]> {
    return this.newsService.getManageList(query);
  }

  @MessagePattern(NewsMessage.GET_MANAGE_BY_ID)
  async getManageById(@Payload() id: NewsId): Promise<NewsDto> {
    return this.newsService.getManageById(id);
  }

  @MessagePattern(NewsMessage.GET_MANAGE_TAGS)
  async getManageTags(): Promise<string[]> {
    return this.newsService.getManageTags();
  }

  @MessagePattern(NewsMessage.UPDATE_BY_ID)
  async updateById(
    @Payload() [id, data]: [NewsId, UpdateNewsDto],
  ): Promise<NewsDto> {
    return this.newsService.updateById(id, data);
  }

  @MessagePattern(NewsMessage.DELETE_BY_ID)
  async deleteById(@Payload() id: NewsId): Promise<NewsDto> {
    return this.newsService.deleteById(id);
  }

  @MessagePattern(NewsMessage.UPDATE_STATUS_BY_ID)
  async updateStatusById(
    @Payload() [id, data]: [NewsId, UpdateNewsStatusDto],
  ): Promise<NewsDto> {
    return this.newsService.updateStatusById(id, data);
  }

  @MessagePattern(NewsMessage.UPDATE_COVER_BY_ID)
  async updateCoverById(
    @Payload() [id, data]: [NewsId, UpdateNewsCoverDto],
  ): Promise<NewsDto> {
    return this.newsService.updateCoverById(id, data);
  }

  @MessagePattern(NewsMessage.DELETE_COVER_BY_ID)
  async deleteCoverById(@Payload() id: NewsId): Promise<NewsDto> {
    return this.newsService.deleteCoverById(id);
  }
}
