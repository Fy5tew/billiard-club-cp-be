import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import type { BilliardTableId } from '@app/shared/dtos/billiard-table.dto';
import {
  BookingDto,
  CreateBookingDto,
  UpdateBookingStatusDto,
  GetFreeSlotsDto,
  FreeSlotDto,
} from '@app/shared/dtos/booking.dto';
import type { BookingId } from '@app/shared/dtos/booking.dto';
import type { UserId } from '@app/shared/dtos/user.dto';
import { BookingMessage } from '@app/shared/services/booking/booking.messages';

import { BookingService } from './booking.service';

@Controller()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @MessagePattern(BookingMessage.CREATE)
  async create(
    @Payload() [userId, data]: [UserId, CreateBookingDto],
  ): Promise<BookingDto> {
    return await this.bookingService.create(userId, data);
  }

  @MessagePattern(BookingMessage.UPDATE_STATUS_BY_ID)
  async updateStatusById(
    @Payload() [id, data]: [BookingId, UpdateBookingStatusDto],
  ): Promise<BookingDto> {
    return await this.bookingService.updateStatusById(id, data);
  }

  @MessagePattern(BookingMessage.GET_FREE_SLOTS_BY_BILLIARD_TABLE)
  async getFreeSlotsByBilliardTableId(
    @Payload() [tableId, query]: [BilliardTableId, GetFreeSlotsDto],
  ): Promise<FreeSlotDto[]> {
    return await this.bookingService.getFreeSlotsByBilliardTableId(
      tableId,
      query,
    );
  }

  @MessagePattern(BookingMessage.GET_BOOKINGS)
  async getBookings(): Promise<BookingDto[]> {
    return await this.bookingService.getBookings();
  }

  @MessagePattern(BookingMessage.GET_BY_ID)
  async getById(@Payload() id: BookingId): Promise<BookingDto> {
    return await this.bookingService.getById(id);
  }

  @MessagePattern(BookingMessage.GET_BY_USER_ID)
  async getByUserId(@Payload() userId: UserId): Promise<BookingDto[]> {
    return await this.bookingService.getByUserId(userId);
  }

  @MessagePattern(BookingMessage.GET_BY_BILLIARD_TABLE_ID)
  async getByBilliardTableId(
    @Payload() tableId: BilliardTableId,
  ): Promise<BookingDto[]> {
    return await this.bookingService.getByBilliardTableId(tableId);
  }
}
