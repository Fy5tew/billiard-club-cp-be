import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import type { BilliardTableId } from '@app/shared/dtos/billiard-table.dto';
import {
  BilliardTableDto,
  BilliardTablePhotoDto,
  BilliardTablePhotoId,
  CreateBilliardTableDto,
  CreateBilliardTablePhotoDto,
  ReorderBilliardTablePhotosDto,
  SimplifiedBilliardTableDto,
  UpdateBilliardTableDto,
  UpdateBilliardTablePhotosDto,
} from '@app/shared/dtos/billiard-table.dto';
import { BilliardTablePhotoEntity } from '@app/shared/entities/billiard-table-photo.entity';
import { BilliardTableEntity } from '@app/shared/entities/billiard-table.entity';
import { CatchDatabaseError } from '@app/shared/helpers/catch-database-error.decorator';
import { StorageClient } from '@app/shared/services/storage/storage.client';
import { DatabaseErrorCode } from '@app/shared/types/database-error.types';

import { BUCKET_NAME } from './billiard-tables.constants';
import { getBilliardTablePhotoPath } from './billiard-tables.utils';

@Injectable()
export class BilliardTablesService {
  constructor(
    @InjectRepository(BilliardTableEntity)
    private readonly tables: Repository<BilliardTableEntity>,
    @InjectRepository(BilliardTablePhotoEntity)
    private readonly photos: Repository<BilliardTablePhotoEntity>,
    private readonly storageClient: StorageClient,
  ) {}

  async create(data: CreateBilliardTableDto): Promise<BilliardTableDto> {
    return await this.mapTableEntityToDto(await this.createEntity(data));
  }

  async updateById(
    id: BilliardTableId,
    data: UpdateBilliardTableDto,
  ): Promise<BilliardTableDto> {
    return await this.mapTableEntityToDto(
      await this.updateEntityById(id, data),
    );
  }

  async addPhotos(
    tableId: BilliardTableId,
    photosData: CreateBilliardTablePhotoDto[],
  ): Promise<BilliardTableDto> {
    return await this.mapTableEntityToDto(
      await this.addPhotosToEntity(tableId, photosData),
    );
  }

  async updatePhotos(
    tableId: BilliardTableId,
    data: UpdateBilliardTablePhotosDto,
  ): Promise<BilliardTableDto> {
    return await this.mapTableEntityToDto(
      await this.updateEntityPhotos(tableId, data),
    );
  }

  async deletePhotoById(
    tableId: BilliardTableId,
    photoId: BilliardTablePhotoId,
  ): Promise<BilliardTableDto> {
    return await this.mapTableEntityToDto(
      await this.deleteEntityPhotoById(tableId, photoId),
    );
  }

  async reorderPhotos(
    tableId: BilliardTableId,
    { photoIds }: ReorderBilliardTablePhotosDto,
  ): Promise<BilliardTableDto> {
    return await this.mapTableEntityToDto(
      await this.reorderEntityPhotos(tableId, photoIds),
    );
  }

  async getById(id: BilliardTableId): Promise<BilliardTableDto> {
    return await this.mapTableEntityToDto(await this.getEntityById(id));
  }

  async getTables(): Promise<BilliardTableDto[]> {
    const tables = await this.tables.find({
      relations: { photos: true },
      order: { photos: { sortOrder: 'ASC', createdAt: 'ASC' } },
    });

    return Promise.all(tables.map((table) => this.mapTableEntityToDto(table)));
  }

  async getTablesSimplified(): Promise<SimplifiedBilliardTableDto[]> {
    const tables = await this.tables.find({
      select: {
        id: true,
        title: true,
      },
      order: {
        title: 'ASC',
      },
    });

    return tables.map((table) =>
      plainToInstance(SimplifiedBilliardTableDto, table, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async deleteById(id: BilliardTableId): Promise<BilliardTableDto> {
    return await this.mapTableEntityToDto(await this.deleteEntityById(id));
  }

  @CatchDatabaseError(
    DatabaseErrorCode.UNIQUE_VIOLATION,
    ({ args: [{ title }] }) => {
      throw new ConflictException(
        `Billiard table with title '${title}' already exists`,
      );
    },
  )
  private async createEntity({
    photoFilenames,
    ...data
  }: CreateBilliardTableDto): Promise<BilliardTableEntity> {
    const table = this.tables.create(data);
    const newTable = await this.tables.save(table);

    if (photoFilenames?.length) {
      const photoEntities = photoFilenames.map((filename, index) =>
        this.photos.create({
          billiardTableId: newTable.id,
          photoFilename: filename,
          sortOrder: index,
          billiardTable: newTable,
        }),
      );

      await this.photos.save(photoEntities);
      newTable.photos = photoEntities;
    }

    return newTable;
  }

  private async updateEntityById(
    id: BilliardTableId,
    data: UpdateBilliardTableDto,
  ): Promise<BilliardTableEntity> {
    const table = await this.getEntityById(id);

    Object.assign(table, data);

    return await this.tables.save(table);
  }

  private async addPhotosToEntity(
    tableId: BilliardTableId,
    photosData: CreateBilliardTablePhotoDto[],
  ): Promise<BilliardTableEntity> {
    const table = await this.getEntityById(tableId);
    const nextSortOrder = table.photos.length;

    const photoEntities = await Promise.all(
      photosData.map(
        async ({ filename: originalFilename, buffer, mimeType }, index) => {
          const newPhotoFilename = `${uuid()}-${originalFilename}`;
          const photoPath = getBilliardTablePhotoPath(
            tableId,
            newPhotoFilename,
          );

          await this.storageClient.uploadFile({
            bucket: BUCKET_NAME,
            filename: photoPath,
            buffer,
            mimeType,
          });

          return this.photos.create({
            billiardTableId: tableId,
            photoFilename: newPhotoFilename,
            sortOrder: nextSortOrder + index,
            billiardTable: table,
          });
        },
      ),
    );

    await this.photos.save(photoEntities);

    table.photos = this.sortPhotos([...(table.photos || []), ...photoEntities]);

    return table;
  }

  private async updateEntityPhotos(
    tableId: BilliardTableId,
    { photoIdsToDelete, orderedPhotoIds }: UpdateBilliardTablePhotosDto,
  ): Promise<BilliardTableEntity> {
    let table = await this.getEntityById(tableId);

    if (photoIdsToDelete?.length) {
      table = await this.deletePhotosByIds(table, photoIdsToDelete);
    }

    if (orderedPhotoIds?.length) {
      table = await this.reorderEntityPhotos(tableId, orderedPhotoIds);
    }

    return table;
  }

  @CatchDatabaseError(
    DatabaseErrorCode.INVALID_TEXT_REPRESENTATION,
    ({ args: [id] }) => {
      throw new BadRequestException(
        `Invalid UUID format provided for table ID: '${id}'`,
      );
    },
  )
  private async getEntityById(
    id: BilliardTableId,
  ): Promise<BilliardTableEntity> {
    const table = await this.tables.findOne({
      where: { id },
      relations: { photos: true },
      order: { photos: { sortOrder: 'ASC', createdAt: 'ASC' } },
    });

    if (!table) {
      throw new NotFoundException(
        `Billiard table with id '${id}' does not exist`,
      );
    }

    return table;
  }

  private async deleteEntityById(
    id: BilliardTableId,
  ): Promise<BilliardTableEntity> {
    const table = await this.getEntityById(id);

    if (table.photos?.length) {
      await Promise.all(
        table.photos.map((photo) =>
          this.storageClient.deleteFile({
            bucket: BUCKET_NAME,
            filename: getBilliardTablePhotoPath(id, photo.photoFilename),
          }),
        ),
      );
    }

    await this.tables.remove(table);

    return table;
  }

  private async deleteEntityPhotoById(
    tableId: BilliardTableId,
    photoId: BilliardTablePhotoId,
  ): Promise<BilliardTableEntity> {
    const table = await this.getEntityById(tableId);

    await this.deletePhotosByIds(table, [photoId]);

    return await this.getEntityById(tableId);
  }

  private async reorderEntityPhotos(
    tableId: BilliardTableId,
    orderedPhotoIds: BilliardTablePhotoId[],
  ): Promise<BilliardTableEntity> {
    const table = await this.getEntityById(tableId);
    const currentPhotoIds = table.photos.map((photo) => photo.id);

    this.validatePhotoOrder(currentPhotoIds, orderedPhotoIds);

    const reorderedPhotos = orderedPhotoIds.map((photoId, index) => {
      const photo = table.photos.find(({ id }) => id === photoId);

      if (!photo) {
        throw new NotFoundException(
          `Photo with id '${photoId}' does not exist for table '${tableId}'`,
        );
      }

      photo.sortOrder = index;

      return photo;
    });

    await this.persistPhotoOrder(reorderedPhotos);

    return await this.getEntityById(tableId);
  }

  private async deletePhotosByIds(
    table: BilliardTableEntity,
    photoIdsToDelete: BilliardTablePhotoId[],
  ): Promise<BilliardTableEntity> {
    const photosToDelete =
      table.photos?.filter((photo) => photoIdsToDelete.includes(photo.id)) ||
      [];

    if (!photosToDelete.length) {
      throw new NotFoundException(
        `No photos with ids '${photoIdsToDelete.join(', ')}' were found for table '${table.id}'`,
      );
    }

    const missingPhotoIds = photoIdsToDelete.filter(
      (photoId) => !photosToDelete.some(({ id }) => id === photoId),
    );

    if (missingPhotoIds.length) {
      throw new NotFoundException(
        `Photos with ids '${missingPhotoIds.join(', ')}' were not found for table '${table.id}'`,
      );
    }

    await Promise.all(
      photosToDelete.map((photo) =>
        this.storageClient.deleteFile({
          bucket: BUCKET_NAME,
          filename: getBilliardTablePhotoPath(table.id, photo.photoFilename),
        }),
      ),
    );

    const remainingPhotos = this.sortPhotos(
      table.photos.filter((photo) => !photoIdsToDelete.includes(photo.id)),
    );

    const deleteResult = await this.photos.delete(
      photosToDelete.map(({ id }) => id),
    );

    if (deleteResult.affected !== photosToDelete.length) {
      throw new NotFoundException(
        `Failed to delete all requested photos for table '${table.id}'`,
      );
    }

    if (remainingPhotos.length) {
      await this.persistPhotoOrder(remainingPhotos);
    }

    table.photos = remainingPhotos;

    return table;
  }

  private async persistPhotoOrder(
    photos: BilliardTablePhotoEntity[],
  ): Promise<void> {
    await this.photos.save(
      photos.map((photo, index) => {
        photo.sortOrder = index;
        return photo;
      }),
    );
  }

  private sortPhotos(
    photos: BilliardTablePhotoEntity[],
  ): BilliardTablePhotoEntity[] {
    return [...photos].sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return this.getPhotoTimestamp(left) - this.getPhotoTimestamp(right);
    });
  }

  private getPhotoTimestamp(photo: BilliardTablePhotoEntity): number {
    return photo.createdAt instanceof Date ? photo.createdAt.getTime() : 0;
  }

  private validatePhotoOrder(
    currentPhotoIds: BilliardTablePhotoId[],
    orderedPhotoIds: BilliardTablePhotoId[],
  ): void {
    if (currentPhotoIds.length !== orderedPhotoIds.length) {
      throw new BadRequestException(
        'Photo reorder payload must contain all existing photo IDs exactly once',
      );
    }

    const currentPhotoIdSet = new Set(currentPhotoIds);
    const orderedPhotoIdSet = new Set(orderedPhotoIds);

    if (
      currentPhotoIdSet.size !== orderedPhotoIdSet.size ||
      orderedPhotoIds.some((photoId) => !currentPhotoIdSet.has(photoId))
    ) {
      throw new BadRequestException(
        'Photo reorder payload must contain all existing photo IDs exactly once',
      );
    }
  }

  private async mapTableEntityToDto(
    tableEntity: BilliardTableEntity,
  ): Promise<BilliardTableDto> {
    const tableDto = plainToInstance(BilliardTableDto, tableEntity, {
      excludeExtraneousValues: true,
    });

    if (tableEntity.photos?.length) {
      tableDto.photos = await Promise.all(
        this.sortPhotos(tableEntity.photos).map(async (photo) => {
          const photoDto = plainToInstance(BilliardTablePhotoDto, photo, {
            excludeExtraneousValues: true,
          });

          photoDto.photoUrl = await this.storageClient.getFileUrl({
            bucket: BUCKET_NAME,
            filename: getBilliardTablePhotoPath(
              tableEntity.id,
              photo.photoFilename,
            ),
          });

          return photoDto;
        }),
      );
    } else {
      tableDto.photos = [];
    }

    return tableDto;
  }
}
