import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  BilliardTableDto,
  CreateBilliardTableDto,
  UpdateBilliardTableDto,
  UpdateBilliardTablePhotosDto,
} from '@app/shared/dtos/billiard-table.dto';
import type {
  BilliardTableId,
  CreateBilliardTablePhotoDto,
} from '@app/shared/dtos/billiard-table.dto';
import { BilliardTablesMessage } from '@app/shared/services/billiard-tables/billiard-tables.messages';

import { BilliardTablesService } from './billiard-tables.service';

@Controller()
export class BilliardTablesController {
  constructor(private readonly billiardTablesService: BilliardTablesService) {}

  @MessagePattern(BilliardTablesMessage.CREATE)
  async create(
    @Payload() data: CreateBilliardTableDto,
  ): Promise<BilliardTableDto> {
    return this.billiardTablesService.create(data);
  }

  @MessagePattern(BilliardTablesMessage.GET_ALL)
  async getAll(): Promise<BilliardTableDto[]> {
    return this.billiardTablesService.getAll();
  }

  @MessagePattern(BilliardTablesMessage.GET_BY_ID)
  async getById(@Payload() id: BilliardTableId): Promise<BilliardTableDto> {
    return this.billiardTablesService.getById(id);
  }

  @MessagePattern(BilliardTablesMessage.UPDATE_BY_ID)
  async updateById(
    @Payload() [id, data]: [BilliardTableId, UpdateBilliardTableDto],
  ): Promise<BilliardTableDto> {
    return this.billiardTablesService.updateById(id, data);
  }

  @MessagePattern(BilliardTablesMessage.ADD_PHOTOS)
  async addPhotos(
    @Payload()
    [tableId, photosData]: [BilliardTableId, CreateBilliardTablePhotoDto[]],
  ): Promise<BilliardTableDto> {
    return this.billiardTablesService.addPhotos(tableId, photosData);
  }

  @MessagePattern(BilliardTablesMessage.UPDATE_PHOTOS)
  async updatePhotos(
    @Payload()
    [tableId, updateData]: [BilliardTableId, UpdateBilliardTablePhotosDto],
  ): Promise<BilliardTableDto> {
    return this.billiardTablesService.updatePhotos(tableId, updateData);
  }

  @MessagePattern(BilliardTablesMessage.DELETE_BY_ID)
  async deleteById(@Payload() id: BilliardTableId): Promise<BilliardTableDto> {
    return this.billiardTablesService.deleteById(id);
  }
}
