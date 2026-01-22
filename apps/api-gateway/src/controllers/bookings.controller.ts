import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import type { BilliardTableId } from '@app/shared/dtos/billiard-table.dto';
import {
  BookingDto,
  type BookingId,
  BookingStatus,
  CreateBookingDto,
  UpdateBookingStatusDto,
  GetFreeSlotsDto,
  FreeSlotDto,
} from '@app/shared/dtos/booking.dto';
import { UserRole, type UserId } from '@app/shared/dtos/user.dto';
import { BookingClient } from '@app/shared/services/booking/booking.client';
import type { RequestWithUser } from '@app/shared/types/auth.types';

import { RoleAccess } from '../auth/auth.decorators';
import { BookingsRoute } from '../constants/bookings.constants';

@ApiTags('Bookings')
@Controller(BookingsRoute.BASE)
export class BookingsController {
  constructor(private readonly bookingClient: BookingClient) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new booking' })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Booking created',
    type: BookingDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid time range',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Table already booked',
  })
  @RoleAccess(UserRole.User)
  @Post()
  async create(
    @Req() { user }: RequestWithUser,
    @Body() data: CreateBookingDto,
  ): Promise<BookingDto> {
    return this.bookingClient.create(user.id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get free slots for billiard table' })
  @ApiParam({ name: 'billiardTableId', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Free slots list',
    type: [FreeSlotDto],
  })
  @RoleAccess(UserRole.User)
  @Get(BookingsRoute.FREE_SLOTS_FOR_BILLIARD_TABLE)
  async getFreeSlots(
    @Param('billiardTableId') tableId: BilliardTableId,
    @Query() query: GetFreeSlotsDto,
  ): Promise<FreeSlotDto[]> {
    return this.bookingClient.getFreeSlotsByBilliardTableId(tableId, query);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User bookings list',
    type: [BookingDto],
  })
  @RoleAccess(UserRole.User)
  @Get(BookingsRoute.MY)
  async getMyBookings(@Req() { user }: RequestWithUser): Promise<BookingDto[]> {
    return this.bookingClient.getByUserId(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bookings by user ID' })
  @ApiParam({ name: 'userId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: [BookingDto] })
  @RoleAccess(UserRole.Manager)
  @Get(BookingsRoute.BOOKINGS_BY_USER)
  async getByUserId(@Param('userId') userId: UserId): Promise<BookingDto[]> {
    return this.bookingClient.getByUserId(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bookings by billiard table ID' })
  @ApiParam({ name: 'billiardTableId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: [BookingDto] })
  @RoleAccess(UserRole.Manager)
  @Get(BookingsRoute.BOOKINGS_BY_BILLIARD_TABLE)
  async getByTableId(
    @Param('billiardTableId') tableId: BilliardTableId,
  ): Promise<BookingDto[]> {
    return this.bookingClient.getByBilliardTableId(tableId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  @RoleAccess(UserRole.User)
  @Get(BookingsRoute.BOOKING)
  async getById(@Param('id') id: BookingId): Promise<BookingDto> {
    return this.bookingClient.getById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update status manually (Manager)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateBookingStatusDto })
  @ApiResponse({ status: HttpStatus.OK, type: BookingDto })
  @RoleAccess(UserRole.Manager)
  @Put(BookingsRoute.BOOKING_STATUS)
  async updateStatus(
    @Param('id') id: BookingId,
    @Body() data: UpdateBookingStatusDto,
  ): Promise<BookingDto> {
    return this.bookingClient.updateStatusById(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingDto })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not your booking',
  })
  @RoleAccess(UserRole.User)
  @Post(BookingsRoute.CANCEL_BOOKING)
  async cancel(
    @Param('id') id: BookingId,
    @Req() { user }: RequestWithUser,
  ): Promise<BookingDto> {
    await this.checkOwnership(id, user.id);

    return this.bookingClient.updateStatusById(id, {
      status: BookingStatus.Cancelled,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm booking (Manager)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingDto })
  @RoleAccess(UserRole.Manager)
  @Post(BookingsRoute.CONFIRM_BOOKING)
  async confirm(@Param('id') id: BookingId): Promise<BookingDto> {
    return this.bookingClient.updateStatusById(id, {
      status: BookingStatus.Confirmed,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pay for booking' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingDto })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not your booking',
  })
  @RoleAccess(UserRole.User)
  @Post(BookingsRoute.PAY_BOOKING)
  async pay(
    @Param('id') id: BookingId,
    @Req() { user }: RequestWithUser,
  ): Promise<BookingDto> {
    await this.checkOwnership(id, user.id);

    return this.bookingClient.updateStatusById(id, {
      status: BookingStatus.Paid,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings (Admin/Manager)' })
  @ApiResponse({ status: HttpStatus.OK, type: [BookingDto] })
  @RoleAccess(UserRole.Manager)
  @Get()
  async getAll(): Promise<BookingDto[]> {
    return this.bookingClient.getBookings();
  }

  private async checkOwnership(
    bookingId: BookingId,
    currentUserId: UserId,
  ): Promise<void> {
    const booking = await this.bookingClient.getById(bookingId);

    if (booking.userId !== currentUserId) {
      throw new ForbiddenException(
        'You do not have permission to modify this booking',
      );
    }
  }
}
