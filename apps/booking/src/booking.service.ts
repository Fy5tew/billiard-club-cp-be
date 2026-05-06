import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Between, In, LessThan, MoreThan, Not, Repository } from 'typeorm';

import type { BilliardTableId } from '@app/shared/dtos/billiard-table.dto';
import {
  BookingDto,
  BookingStatus,
  BookingId,
  CreateBookingContextDto,
  CreateBookingDto,
  UpdateBookingStatusDto,
  GetBookedSlotsDto,
  BookedSlotDto,
} from '@app/shared/dtos/booking.dto';
import type { UserId } from '@app/shared/dtos/user.dto';
import { BookingEntity } from '@app/shared/entities/booking.entity';

import {
  BOOKING_DAYS_AHEAD,
  BOOKING_MAX_DURATION_HOURS,
  BOOKING_MAX_DURATION_MINUTES,
  BOOKING_MIN_DURATION_MINUTES,
  BOOKING_SLOT_STEP_MINUTES,
  BOOKING_WORK_END_MINUTES,
  BOOKING_WORK_START_MINUTES,
  BUSINESS_TIMEZONE_OFFSET_HOURS,
  HOUR_IN_MS,
  MINUTE_IN_MS,
} from './booking.constants';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
  ) {}

  async create(
    userId: UserId,
    data: CreateBookingDto,
    context: CreateBookingContextDto,
  ): Promise<BookingDto> {
    const { billiardTableId, startTime, endTime } = data;
    const currentDate = this.getCurrentBusinessClockDate();
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate <= currentDate) {
      throw new BadRequestException('Start time must be in the future');
    }

    if (startDate >= endDate) {
      throw new BadRequestException('Start time must be before end time');
    }

    this.validateBookingTimeRange(currentDate, startDate, endDate);

    const overlappingBooking = await this.bookings.findOne({
      where: {
        billiardTableId,
        status: Not(In([BookingStatus.Cancelled, BookingStatus.Rejected])),
        startTime: LessThan(endDate),
        endTime: MoreThan(startDate),
      },
    });

    if (overlappingBooking) {
      throw new ConflictException(
        'Table is already booked for this time period',
      );
    }

    const durationHours =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const totalCost = durationHours * Number(context.hourlyPrice);

    const entity = this.bookings.create({
      userId,
      billiardTableId,
      startTime: startDate,
      endTime: endDate,
      totalCost,
      status: BookingStatus.Pending,
    });

    return this.mapEntityToDto(await this.bookings.save(entity));
  }

  async updateStatusById(
    id: BookingId,
    { status }: UpdateBookingStatusDto,
  ): Promise<BookingDto> {
    const booking = await this.getEntityById(id);

    this.validateStatusTransition(booking.status, status);

    booking.status = status;

    return this.mapEntityToDto(await this.bookings.save(booking));
  }

  async getBookedSlotsByBilliardTableId(
    tableId: BilliardTableId,
    { date }: GetBookedSlotsDto,
  ): Promise<BookedSlotDto[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await this.bookings.find({
      where: {
        billiardTableId: tableId,
        status: Not(In([BookingStatus.Cancelled, BookingStatus.Rejected])),
        startTime: Between(startOfDay, endOfDay),
      },
      order: { startTime: 'ASC' },
    });

    return existingBookings.map((b) => ({
      start: b.startTime,
      end: b.endTime,
    }));
  }

  async getBookings(): Promise<BookingDto[]> {
    const entities = await this.bookings.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapEntityToDto(e));
  }

  async getUpcomingBookings(): Promise<BookingDto[]> {
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 3);
    const endOfCurrentDay = new Date(currentDate);
    endOfCurrentDay.setHours(23, 59, 59, 999);

    const entities = await this.bookings.find({
      where: {
        status: In([BookingStatus.Confirmed, BookingStatus.Paid]),
        endTime: Between(currentDate, endOfCurrentDay),
      },
      order: { startTime: 'ASC' },
    });

    return entities.map((e) => this.mapEntityToDto(e));
  }

  async getById(id: BookingId): Promise<BookingDto> {
    return this.mapEntityToDto(await this.getEntityById(id));
  }

  async getByUserId(userId: UserId): Promise<BookingDto[]> {
    const entities = await this.bookings.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapEntityToDto(e));
  }

  async getByBilliardTableId(tableId: BilliardTableId): Promise<BookingDto[]> {
    const entities = await this.bookings.find({
      where: { billiardTableId: tableId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapEntityToDto(e));
  }

  private validateStatusTransition(
    current: BookingStatus,
    next: BookingStatus,
  ) {
    if (current === BookingStatus.Paid) {
      throw new BadRequestException('Cannot change status of a paid booking');
    }

    const isTerminalBeforePayment = [
      BookingStatus.Cancelled,
      BookingStatus.Rejected,
    ].includes(next);

    if (isTerminalBeforePayment) return;

    if (current === BookingStatus.Pending && next === BookingStatus.Confirmed)
      return;
    if (current === BookingStatus.Confirmed && next === BookingStatus.Paid)
      return;

    throw new BadRequestException(
      `Invalid status transition from ${BookingStatus[current]} to ${BookingStatus[next]}`,
    );
  }

  private getCurrentBusinessClockDate(): Date {
    return new Date(Date.now() + BUSINESS_TIMEZONE_OFFSET_HOURS * HOUR_IN_MS);
  }

  private validateBookingTimeRange(
    currentDate: Date,
    startDate: Date,
    endDate: Date,
  ): void {
    const maxBookingDate = new Date(currentDate);
    maxBookingDate.setUTCDate(maxBookingDate.getUTCDate() + BOOKING_DAYS_AHEAD);
    maxBookingDate.setUTCHours(23, 59, 59, 999);

    if (startDate > maxBookingDate) {
      throw new BadRequestException(
        `Booking can be created only up to ${BOOKING_DAYS_AHEAD} days ahead`,
      );
    }

    const bookingDayStart = new Date(startDate);
    bookingDayStart.setUTCHours(0, 0, 0, 0);

    const startMinutes =
      (startDate.getTime() - bookingDayStart.getTime()) / MINUTE_IN_MS;
    const endMinutes =
      (endDate.getTime() - bookingDayStart.getTime()) / MINUTE_IN_MS;
    const durationMinutes =
      (endDate.getTime() - startDate.getTime()) / MINUTE_IN_MS;

    if (
      startMinutes % BOOKING_SLOT_STEP_MINUTES !== 0 ||
      endMinutes % BOOKING_SLOT_STEP_MINUTES !== 0
    ) {
      throw new BadRequestException(
        `Booking time must align with ${BOOKING_SLOT_STEP_MINUTES}-minute slots`,
      );
    }

    if (
      durationMinutes < BOOKING_MIN_DURATION_MINUTES ||
      durationMinutes > BOOKING_MAX_DURATION_MINUTES
    ) {
      throw new BadRequestException(
        `Booking duration must be between ${BOOKING_MIN_DURATION_MINUTES} minutes and ${BOOKING_MAX_DURATION_HOURS} hours`,
      );
    }

    if (
      startMinutes < BOOKING_WORK_START_MINUTES ||
      endMinutes > BOOKING_WORK_END_MINUTES
    ) {
      throw new BadRequestException(
        `Booking time must be within club working hours (${BOOKING_WORK_START_MINUTES / 60}:00-${BOOKING_WORK_END_MINUTES / 60}:00)`,
      );
    }
  }

  private async getEntityById(id: BookingId): Promise<BookingEntity> {
    const entity = await this.bookings.findOne({
      where: { id },
    });
    if (!entity)
      throw new NotFoundException(`Booking with id '${id}' not found`);
    return entity;
  }

  private mapEntityToDto(entity: BookingEntity): BookingDto {
    return plainToInstance(BookingDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
