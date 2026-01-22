import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Service } from '../services.types';
import { BilliardTablesMessage } from './billiard-tables.messages';
import {
  BilliardTableDto,
  CreateBilliardTableDto,
  UpdateBilliardTableDto,
  UpdateBilliardTablePhotosDto,
  BilliardTableId,
  CreateBilliardTablePhotoDto,
} from '../../dtos/billiard-table.dto';

@Injectable()
export class BilliardTablesClient {
  constructor(
    @Inject(Service.BILLIARD_TABLES) private readonly client: ClientProxy,
  ) {}

  async create(data: CreateBilliardTableDto): Promise<BilliardTableDto> {
    return firstValueFrom(
      this.client.send<BilliardTableDto, CreateBilliardTableDto>(
        BilliardTablesMessage.CREATE,
        data,
      ),
    );
  }

  async getTables(): Promise<BilliardTableDto[]> {
    return firstValueFrom(
      this.client.send<BilliardTableDto[], object>(
        BilliardTablesMessage.GET_TABLES,
        {},
      ),
    );
  }

  async getById(id: BilliardTableId): Promise<BilliardTableDto> {
    return firstValueFrom(
      this.client.send<BilliardTableDto, BilliardTableId>(
        BilliardTablesMessage.GET_BY_ID,
        id,
      ),
    );
  }

  async updateById(
    id: BilliardTableId,
    data: UpdateBilliardTableDto,
  ): Promise<BilliardTableDto> {
    return firstValueFrom(
      this.client.send<
        BilliardTableDto,
        [BilliardTableId, UpdateBilliardTableDto]
      >(BilliardTablesMessage.UPDATE_BY_ID, [id, data]),
    );
  }

  async addPhotos(
    tableId: BilliardTableId,
    photosData: CreateBilliardTablePhotoDto[],
  ): Promise<BilliardTableDto> {
    return firstValueFrom(
      this.client.send<
        BilliardTableDto,
        [BilliardTableId, CreateBilliardTablePhotoDto[]]
      >(BilliardTablesMessage.ADD_PHOTOS, [tableId, photosData]),
    );
  }

  async updatePhotos(
    tableId: BilliardTableId,
    updateData: UpdateBilliardTablePhotosDto,
  ): Promise<BilliardTableDto> {
    return firstValueFrom(
      this.client.send<
        BilliardTableDto,
        [BilliardTableId, UpdateBilliardTablePhotosDto]
      >(BilliardTablesMessage.UPDATE_PHOTOS, [tableId, updateData]),
    );
  }

  async deleteById(id: BilliardTableId): Promise<BilliardTableDto> {
    return firstValueFrom(
      this.client.send<BilliardTableDto, BilliardTableId>(
        BilliardTablesMessage.DELETE_BY_ID,
        id,
      ),
    );
  }
}
