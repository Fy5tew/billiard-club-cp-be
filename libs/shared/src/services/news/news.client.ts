import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { NewsMessage } from './news.messages';
import {
  CreateNewsDto,
  GetManageNewsQueryDto,
  GetPublicNewsQueryDto,
  NewsDto,
  NewsId,
  UpdateNewsCoverDto,
  UpdateNewsDto,
  UpdateNewsStatusDto,
} from '../../dtos/news.dto';
import type { UserId } from '../../dtos/user.dto';
import { Service } from '../services.types';

@Injectable()
export class NewsClient {
  constructor(@Inject(Service.NEWS) private readonly client: ClientProxy) {}

  async create(authorId: UserId, data: CreateNewsDto): Promise<NewsDto> {
    return firstValueFrom(
      this.client.send<NewsDto, [UserId, CreateNewsDto]>(NewsMessage.CREATE, [
        authorId,
        data,
      ]),
    );
  }

  async getPublicList(query: GetPublicNewsQueryDto = {}): Promise<NewsDto[]> {
    return firstValueFrom(
      this.client.send<NewsDto[], GetPublicNewsQueryDto>(
        NewsMessage.GET_PUBLIC_LIST,
        query,
      ),
    );
  }

  async getPublicById(id: NewsId): Promise<NewsDto> {
    return firstValueFrom(
      this.client.send<NewsDto, NewsId>(NewsMessage.GET_PUBLIC_BY_ID, id),
    );
  }

  async getPublicTags(): Promise<string[]> {
    return firstValueFrom(
      this.client.send<string[], unknown>(NewsMessage.GET_PUBLIC_TAGS, {}),
    );
  }

  async getManageList(query: GetManageNewsQueryDto = {}): Promise<NewsDto[]> {
    return firstValueFrom(
      this.client.send<NewsDto[], GetManageNewsQueryDto>(
        NewsMessage.GET_MANAGE_LIST,
        query,
      ),
    );
  }

  async getManageById(id: NewsId): Promise<NewsDto> {
    return firstValueFrom(
      this.client.send<NewsDto, NewsId>(NewsMessage.GET_MANAGE_BY_ID, id),
    );
  }

  async getManageTags(): Promise<string[]> {
    return firstValueFrom(
      this.client.send<string[], unknown>(NewsMessage.GET_MANAGE_TAGS, {}),
    );
  }

  async updateById(id: NewsId, data: UpdateNewsDto): Promise<NewsDto> {
    return firstValueFrom(
      this.client.send<NewsDto, [NewsId, UpdateNewsDto]>(
        NewsMessage.UPDATE_BY_ID,
        [id, data],
      ),
    );
  }

  async deleteById(id: NewsId): Promise<NewsDto> {
    return firstValueFrom(
      this.client.send<NewsDto, NewsId>(NewsMessage.DELETE_BY_ID, id),
    );
  }

  async updateStatusById(
    id: NewsId,
    data: UpdateNewsStatusDto,
  ): Promise<NewsDto> {
    return firstValueFrom(
      this.client.send<NewsDto, [NewsId, UpdateNewsStatusDto]>(
        NewsMessage.UPDATE_STATUS_BY_ID,
        [id, data],
      ),
    );
  }

  async updateCoverById(
    id: NewsId,
    data: UpdateNewsCoverDto,
  ): Promise<NewsDto> {
    return firstValueFrom(
      this.client.send<NewsDto, [NewsId, UpdateNewsCoverDto]>(
        NewsMessage.UPDATE_COVER_BY_ID,
        [id, data],
      ),
    );
  }

  async deleteCoverById(id: NewsId): Promise<NewsDto> {
    return firstValueFrom(
      this.client.send<NewsDto, NewsId>(NewsMessage.DELETE_COVER_BY_ID, id),
    );
  }
}
