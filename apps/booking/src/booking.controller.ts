import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import type { BilliardTableId } from '@app/shared/dtos/billiard-table.dto';
import {
  BookingDto,
  CreateBookingContextDto,
  CreateBookingDto,
  GetBusyBilliardTableIdsInRangeDto,
  GetBookingsQueryDto,
  UpdateBookingStatusDto,
} from '@app/shared/dtos/booking.dto';
import type {
  BookedSlotDto,
  BookingId,
  GetBookedSlotsDto,
} from '@app/shared/dtos/booking.dto';
import type { UserId } from '@app/shared/dtos/user.dto';
import { BookingMessage } from '@app/shared/services/booking/booking.messages';

import { BookingService } from './booking.service';

@Controller()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @MessagePattern(BookingMessage.CREATE)
  async create(
    @Payload()
    [userId, data, context]: [
      UserId,
      CreateBookingDto,
      CreateBookingContextDto,
    ],
  ): Promise<BookingDto> {
    return await this.bookingService.create(userId, data, context);
  }

  @MessagePattern(BookingMessage.UPDATE_STATUS_BY_ID)
  async updateStatusById(
    @Payload() [id, data]: [BookingId, UpdateBookingStatusDto],
  ): Promise<BookingDto> {
    return await this.bookingService.updateStatusById(id, data);
  }

  @MessagePattern(BookingMessage.GET_BOOKED_SLOTS_BY_BILLIARD_TABLE)
  async getBookedSlotsByBilliardTableId(
    @Payload() [tableId, query]: [BilliardTableId, GetBookedSlotsDto],
  ): Promise<BookedSlotDto[]> {
    return await this.bookingService.getBookedSlotsByBilliardTableId(
      tableId,
      query,
    );
  }

  @MessagePattern(BookingMessage.GET_BUSY_BILLIARD_TABLE_IDS_IN_RANGE)
  async getBusyBilliardTableIdsInRange(
    @Payload() query: GetBusyBilliardTableIdsInRangeDto,
  ): Promise<BilliardTableId[]> {
    return await this.bookingService.getBusyBilliardTableIdsInRange(query);
  }

  @MessagePattern(BookingMessage.GET_BOOKINGS)
  async getBookings(
    @Payload() query: GetBookingsQueryDto,
  ): Promise<BookingDto[]> {
    return await this.bookingService.getBookings(query);
  }

  @MessagePattern(BookingMessage.GET_BY_ID)
  async getById(@Payload() id: BookingId): Promise<BookingDto> {
    return await this.bookingService.getById(id);
  }
}
