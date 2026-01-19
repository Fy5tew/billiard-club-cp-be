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
    { photoIdsToDelete }: UpdateBilliardTablePhotosDto,
  ): Promise<BilliardTableDto> {
    return await this.mapTableEntityToDto(
      await this.updateEntityPhotos(tableId, photoIdsToDelete),
    );
  }

  async getById(id: BilliardTableId): Promise<BilliardTableDto> {
    return await this.mapTableEntityToDto(await this.getEntityById(id));
  }

  async getAll(): Promise<BilliardTableDto[]> {
    const tables = await this.tables.find({ relations: ['photos'] });
    return Promise.all(tables.map((table) => this.mapTableEntityToDto(table)));
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
      const photoEntities = photoFilenames.map((filename) =>
        this.photos.create({
          billiardTableId: newTable.id,
          photoFilename: filename,
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

    const photoEntities = await Promise.all(
      photosData.map(
        async ({ filename: originalFilename, buffer, mimeType }) => {
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
            billiardTable: table,
          });
        },
      ),
    );

    await this.photos.save(photoEntities);

    table.photos = [...(table.photos || []), ...photoEntities];

    return table;
  }

  private async updateEntityPhotos(
    tableId: BilliardTableId,
    photoIdsToDelete?: BilliardTablePhotoId[],
  ): Promise<BilliardTableEntity> {
    const table = await this.getEntityById(tableId);

    if (photoIdsToDelete?.length) {
      const photosToDelete =
        table.photos?.filter((photo) => photoIdsToDelete.includes(photo.id)) ||
        [];

      photosToDelete.map((photo) => {
        const photoPath = getBilliardTablePhotoPath(
          tableId,
          photo.photoFilename,
        );
        this.storageClient.deleteFile({
          bucket: BUCKET_NAME,
          filename: photoPath,
        });
      });

      await this.photos.remove(photosToDelete);

      table.photos =
        table.photos?.filter((photo) => !photoIdsToDelete.includes(photo.id)) ||
        [];
    }

    return await this.tables.save(table);
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
      relations: ['photos'],
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
      table.photos.map((photo) => {
        const photoPath = getBilliardTablePhotoPath(id, photo.photoFilename);
        this.storageClient.deleteFile({
          bucket: BUCKET_NAME,
          filename: photoPath,
        });
      });
    }

    await this.tables.remove(table);
    return table;
  }

  private async mapTableEntityToDto(
    tableEntity: BilliardTableEntity,
  ): Promise<BilliardTableDto> {
    const tableDto = plainToInstance(BilliardTableDto, tableEntity, {
      excludeExtraneousValues: true,
    });

    if (tableEntity.photos?.length) {
      tableDto.photos = await Promise.all(
        tableEntity.photos.map(async (photo) => {
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
