import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { BookingMessage } from './booking.messages';
import type { BilliardTableId } from '../../dtos/billiard-table.dto';
import {
  BookedSlotDto,
  BookingDto,
  BookingId,
  CreateBookingContextDto,
  CreateBookingDto,
  GetBusyBilliardTableIdsInRangeDto,
  GetBookingsQueryDto,
  GetBookedSlotsDto,
  UpdateBookingStatusDto,
} from '../../dtos/booking.dto';
import type { UserId } from '../../dtos/user.dto';
import { Service } from '../services.types';

@Injectable()
export class BookingClient {
  constructor(@Inject(Service.BOOKING) private readonly client: ClientProxy) {}

  async create(
    userId: UserId,
    data: CreateBookingDto,
    context: CreateBookingContextDto,
  ): Promise<BookingDto> {
    return firstValueFrom(
      this.client.send<
        BookingDto,
        [UserId, CreateBookingDto, CreateBookingContextDto]
      >(BookingMessage.CREATE, [userId, data, context]),
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

  async getBookedSlotsByBilliardTableId(
    tableId: BilliardTableId,
    query: GetBookedSlotsDto,
  ): Promise<BookedSlotDto[]> {
    return firstValueFrom(
      this.client.send<BookedSlotDto[], [BilliardTableId, GetBookedSlotsDto]>(
        BookingMessage.GET_BOOKED_SLOTS_BY_BILLIARD_TABLE,
        [tableId, query],
      ),
    );
  }

  async getBusyBilliardTableIdsInRange(
    query: GetBusyBilliardTableIdsInRangeDto,
  ): Promise<BilliardTableId[]> {
    return firstValueFrom(
      this.client.send<BilliardTableId[], GetBusyBilliardTableIdsInRangeDto>(
        BookingMessage.GET_BUSY_BILLIARD_TABLE_IDS_IN_RANGE,
        query,
      ),
    );
  }

  async getBookings(query: GetBookingsQueryDto = {}): Promise<BookingDto[]> {
    return firstValueFrom(
      this.client.send<BookingDto[], GetBookingsQueryDto>(
        BookingMessage.GET_BOOKINGS,
        query,
      ),
    );
  }

  async getById(id: BookingId): Promise<BookingDto> {
    return firstValueFrom(
      this.client.send<BookingDto, BookingId>(BookingMessage.GET_BY_ID, id),
    );
  }
}
