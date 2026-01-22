import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import {
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import type { BilliardTableId } from '@app/shared/dtos/billiard-table.dto';
import {
  BookingDto,
  BookingStatus,
  BookingId,
  CreateBookingDto,
  UpdateBookingStatusDto,
  GetFreeSlotsDto,
  FreeSlotDto,
} from '@app/shared/dtos/booking.dto';
import type { UserId } from '@app/shared/dtos/user.dto';
import { BookingEntity } from '@app/shared/entities/booking.entity';
import { BilliardTablesClient } from '@app/shared/services/billiard-tables/billiard-tables.client';
import { IdentityClient } from '@app/shared/services/identity/identity.client';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    private readonly identityClient: IdentityClient,
    private readonly billiardTablesClient: BilliardTablesClient,
  ) {}

  async create(userId: UserId, data: CreateBookingDto): Promise<BookingDto> {
    const { billiardTableId, startTime, endTime } = data;

    if (new Date(startTime) >= new Date(endTime)) {
      throw new BadRequestException('Start time must be before end time');
    }

    const table = await this.billiardTablesClient.getById(billiardTableId);
    await this.identityClient.getById(userId);

    const overlappingBooking = await this.bookings.findOne({
      where: {
        billiardTableId,
        status: Not(In([BookingStatus.Cancelled, BookingStatus.Rejected])),
        startTime: LessThanOrEqual(new Date(endTime)),
        endTime: MoreThanOrEqual(new Date(startTime)),
      },
    });

    if (overlappingBooking) {
      throw new ConflictException(
        'Table is already booked for this time period',
      );
    }

    const durationHours =
      (new Date(endTime).getTime() - new Date(startTime).getTime()) /
      (1000 * 60 * 60);
    const totalCost = durationHours * Number(table.hourlyPrice);

    const entity = this.bookings.create({
      userId,
      billiardTableId,
      startTime,
      endTime,
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

  async getFreeSlotsByBilliardTableId(
    tableId: BilliardTableId,
    { date }: GetFreeSlotsDto,
  ): Promise<FreeSlotDto[]> {
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
    const entities = await this.bookings.find();
    return entities.map((e) => this.mapEntityToDto(e));
  }

  async getById(id: BookingId): Promise<BookingDto> {
    return this.mapEntityToDto(await this.getEntityById(id));
  }

  async getByUserId(userId: UserId): Promise<BookingDto[]> {
    const entities = await this.bookings.find({
      where: { userId },
    });
    return entities.map((e) => this.mapEntityToDto(e));
  }

  async getByBilliardTableId(tableId: BilliardTableId): Promise<BookingDto[]> {
    const entities = await this.bookings.find({
      where: { billiardTableId: tableId },
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
