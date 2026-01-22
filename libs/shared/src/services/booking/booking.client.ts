import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { BookingMessage } from './booking.messages';
import type { BilliardTableId } from '../../dtos/billiard-table.dto';
import {
  BookingDto,
  BookingId,
  CreateBookingDto,
  UpdateBookingStatusDto,
  GetFreeSlotsDto,
  FreeSlotDto,
} from '../../dtos/booking.dto';
import type { UserId } from '../../dtos/user.dto';
import { Service } from '../services.types';

@Injectable()
export class BookingClient {
  constructor(@Inject(Service.BOOKING) private readonly client: ClientProxy) {}

  async create(userId: UserId, data: CreateBookingDto): Promise<BookingDto> {
    return firstValueFrom(
      this.client.send<BookingDto, [UserId, CreateBookingDto]>(
        BookingMessage.CREATE,
        [userId, data],
      ),
    );
  }

  async updateStatusById(
    id: BookingId,
    data: UpdateBookingStatusDto,
  ): Promise<BookingDto> {
    return firstValueFrom(
      this.client.send<BookingDto, [BookingId, UpdateBookingStatusDto]>(
        BookingMessage.UPDATE_STATUS_BY_ID,
        [id, data],
      ),
    );
  }

  async getFreeSlotsByBilliardTableId(
    tableId: BilliardTableId,
    query: GetFreeSlotsDto,
  ): Promise<FreeSlotDto[]> {
    return firstValueFrom(
      this.client.send<FreeSlotDto[], [BilliardTableId, GetFreeSlotsDto]>(
        BookingMessage.GET_FREE_SLOTS_BY_BILLIARD_TABLE,
        [tableId, query],
      ),
    );
  }

  async getBookings(): Promise<BookingDto[]> {
    return firstValueFrom(
      this.client.send<BookingDto[], object>(BookingMessage.GET_BOOKINGS, {}),
    );
  }

  async getById(id: BookingId): Promise<BookingDto> {
    return firstValueFrom(
      this.client.send<BookingDto, BookingId>(BookingMessage.GET_BY_ID, id),
    );
  }

  async getByUserId(userId: UserId): Promise<BookingDto[]> {
    return firstValueFrom(
      this.client.send<BookingDto[], UserId>(
        BookingMessage.GET_BY_USER_ID,
        userId,
      ),
    );
  }

  async getByBilliardTableId(tableId: BilliardTableId): Promise<BookingDto[]> {
    return firstValueFrom(
      this.client.send<BookingDto[], BilliardTableId>(
        BookingMessage.GET_BY_BILLIARD_TABLE_ID,
        tableId,
      ),
    );
  }
}
