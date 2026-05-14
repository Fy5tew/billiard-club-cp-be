import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import {
  CreateNewsDto,
  GetManageNewsQueryDto,
  GetPublicNewsQueryDto,
  NewsDto,
  NewsId,
  UpdateNewsCoverDto,
  UpdateNewsDto,
  UpdateNewsStatusDto,
} from '@app/shared/dtos/news.dto';
import type { UserId } from '@app/shared/dtos/user.dto';
import { NewsEntity, NewsStatus } from '@app/shared/entities/news.entity';
import { StorageClient } from '@app/shared/services/storage/storage.client';

import { BUCKET_NAME } from './news.constants';
import {
  buildNewsSearchText,
  createNewsCoverFilename,
  extractTiptapText,
  getNewsCoverPath,
  normalizeNewsTags,
} from './news.utils';

const allowedTransitions: Record<NewsStatus, NewsStatus[]> = {
  [NewsStatus.Draft]: [NewsStatus.Review],
  [NewsStatus.Review]: [NewsStatus.Draft, NewsStatus.Published],
  [NewsStatus.Published]: [NewsStatus.Draft],
};

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
    private readonly storageClient: StorageClient,
  ) {}

  async create(authorId: UserId, data: CreateNewsDto): Promise<NewsDto> {
    const tags = normalizeNewsTags(data.tags);
    const entity = this.newsRepository.create({
      ...data,
      tags,
      authorId,
      status: NewsStatus.Draft,
      publishedAt: null,
      coverImageFilename: null,
      searchText: buildNewsSearchText({ ...data, tags }),
    });

    return this.mapEntityToDto(await this.newsRepository.save(entity));
  }

  async getPublicList(query: GetPublicNewsQueryDto = {}): Promise<NewsDto[]> {
    return this.getList(query, true);
  }

  async getPublicById(id: NewsId): Promise<NewsDto> {
    return this.mapEntityToDto(await this.getEntityById(id, true));
  }

  async getPublicTags(): Promise<string[]> {
    return this.getTags(true);
  }

  async getManageList(query: GetManageNewsQueryDto = {}): Promise<NewsDto[]> {
    return this.getList(query, false);
  }

  async getManageById(id: NewsId): Promise<NewsDto> {
    return this.mapEntityToDto(await this.getEntityById(id, false));
  }

  async getManageTags(): Promise<string[]> {
    return this.getTags(false);
  }

  async updateById(id: NewsId, data: UpdateNewsDto): Promise<NewsDto> {
    const news = await this.getEntityById(id, false);

    this.ensureDraft(news, 'News can be updated only in Draft status');

    const tags =
      data.tags !== undefined ? normalizeNewsTags(data.tags) : news.tags;
    const nextState = {
      ...news,
      ...data,
      tags,
    };

    Object.assign(news, {
      ...data,
      tags,
      searchText: buildNewsSearchText(nextState),
    });

    return this.mapEntityToDto(await this.newsRepository.save(news));
  }

  async deleteById(id: NewsId): Promise<NewsDto> {
    const news = await this.getEntityById(id, false);

    this.ensureDraft(news, 'News can be deleted only in Draft status');

    if (news.coverImageFilename) {
      await this.deleteCoverFile(news);
    }

    return this.mapEntityToDto(await this.newsRepository.remove(news));
  }

  async updateStatusById(
    id: NewsId,
    { status }: UpdateNewsStatusDto,
  ): Promise<NewsDto> {
    const news = await this.getEntityById(id, false);

    this.ensureAllowedTransition(news.status, status);

    if ([NewsStatus.Review, NewsStatus.Published].includes(status)) {
      this.ensureReadyForReviewOrPublishing(news);
    }

    news.status = status;
    news.publishedAt = status === NewsStatus.Published ? new Date() : null;

    return this.mapEntityToDto(await this.newsRepository.save(news));
  }

  async updateCoverById(
    id: NewsId,
    data: UpdateNewsCoverDto,
  ): Promise<NewsDto> {
    const news = await this.getEntityById(id, false);

    this.ensureDraft(news, 'Cover can be changed only in Draft status');

    const nextCoverFilename = createNewsCoverFilename(
      data.filename,
      data.mimeType,
    );

    await this.storageClient.uploadFile({
      bucket: BUCKET_NAME,
      filename: getNewsCoverPath(id, nextCoverFilename),
      buffer: data.buffer,
      mimeType: data.mimeType,
    });

    if (news.coverImageFilename) {
      await this.deleteCoverFile(news);
    }

    news.coverImageFilename = nextCoverFilename;

    return this.mapEntityToDto(await this.newsRepository.save(news));
  }

  async deleteCoverById(id: NewsId): Promise<NewsDto> {
    const news = await this.getEntityById(id, false);

    this.ensureDraft(news, 'Cover can be deleted only in Draft status');

    if (news.coverImageFilename) {
      await this.deleteCoverFile(news);
      news.coverImageFilename = null;
      await this.newsRepository.save(news);
    }

    return this.mapEntityToDto(news);
  }

  private async getList(
    query: GetPublicNewsQueryDto | GetManageNewsQueryDto,
    publicOnly: boolean,
  ): Promise<NewsDto[]> {
    const tags = normalizeNewsTags(query.tags);
    const search = query.search?.trim().toLowerCase();
    const status = 'status' in query ? query.status : undefined;
    const queryBuilder = this.newsRepository.createQueryBuilder('news');

    if (publicOnly) {
      queryBuilder.andWhere('news.status = :status', {
        status: NewsStatus.Published,
      });
    }

    if (status) {
      queryBuilder.andWhere('news.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere('news.searchText ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (tags.length > 0) {
      queryBuilder.andWhere('news.tags @> :tags', { tags });
    }

    queryBuilder
      .orderBy('news.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('news.createdAt', 'DESC');

    const entities = await queryBuilder.getMany();

    return Promise.all(entities.map((entity) => this.mapEntityToDto(entity)));
  }

  private async getTags(publicOnly: boolean): Promise<string[]> {
    const queryBuilder = this.newsRepository
      .createQueryBuilder('news')
      .select('DISTINCT UNNEST(news.tags)', 'tag')
      .orderBy('tag', 'ASC');

    if (publicOnly) {
      queryBuilder.where('news.status = :status', {
        status: NewsStatus.Published,
      });
    }

    const rows = await queryBuilder.getRawMany<{ tag: string | null }>();

    return rows
      .map(({ tag }) => tag)
      .filter((tag): tag is string => Boolean(tag));
  }

  private async getEntityById(
    id: NewsId,
    publicOnly: boolean,
  ): Promise<NewsEntity> {
    const entity = await this.newsRepository.findOne({
      where: publicOnly ? { id, status: NewsStatus.Published } : { id },
    });

    if (!entity) {
      throw new NotFoundException(`News with id '${id}' not found`);
    }

    return entity;
  }

  private ensureDraft(news: NewsEntity, message: string): void {
    if (news.status !== NewsStatus.Draft) {
      throw new BadRequestException(message);
    }
  }

  private ensureAllowedTransition(current: NewsStatus, next: NewsStatus): void {
    if (!allowedTransitions[current].includes(next)) {
      throw new BadRequestException(
        `Invalid news status transition from ${current} to ${next}`,
      );
    }
  }

  private ensureReadyForReviewOrPublishing(news: NewsEntity): void {
    if (!news.title.trim()) {
      throw new BadRequestException('News title cannot be empty');
    }

    if (!news.summary.trim()) {
      throw new BadRequestException('News summary cannot be empty');
    }

    if (!extractTiptapText(news.content).trim()) {
      throw new BadRequestException('News content cannot be empty');
    }
  }

  private async deleteCoverFile(news: NewsEntity): Promise<void> {
    if (!news.coverImageFilename) {
      return;
    }

    await this.storageClient.deleteFile({
      bucket: BUCKET_NAME,
      filename: getNewsCoverPath(news.id, news.coverImageFilename),
    });
  }

  private async mapEntityToDto(entity: NewsEntity): Promise<NewsDto> {
    const newsDto = plainToInstance(NewsDto, entity, {
      excludeExtraneousValues: true,
    });

    newsDto.coverImageUrl = entity.coverImageFilename
      ? await this.storageClient.getFileUrl({
          bucket: BUCKET_NAME,
          filename: getNewsCoverPath(entity.id, entity.coverImageFilename),
        })
      : null;

    return newsDto;
  }
}
