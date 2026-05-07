import { ForbiddenException } from '@nestjs/common';

import {
  BilliardTableStatus,
  BilliardTableType,
} from '@app/shared/dtos/billiard-table.dto';
import { BookingStatus } from '@app/shared/dtos/booking.dto';
import { UserRole } from '@app/shared/dtos/user.dto';
import type { BilliardTablesClient } from '@app/shared/services/billiard-tables/billiard-tables.client';
import type { BookingClient } from '@app/shared/services/booking/booking.client';
import type { IdentityClient } from '@app/shared/services/identity/identity.client';
import type { RequestWithUser } from '@app/shared/types/auth.types';

import { BookingsController } from './bookings.controller';

describe('BookingsController', () => {
  let controller: BookingsController;
  let identityClient: jest.Mocked<Partial<IdentityClient>>;
  let billiardTablesClient: jest.Mocked<Partial<BilliardTablesClient>>;
  let bookingClient: jest.Mocked<Partial<BookingClient>>;

  beforeEach(() => {
    identityClient = {
      getById: jest.fn(),
    };
    billiardTablesClient = {
      getById: jest.fn(),
      getTables: jest.fn(),
    };
    bookingClient = {
      getBusyBilliardTableIdsInRange: jest.fn(),
      getById: jest.fn(),
    };

    controller = new BookingsController(
      identityClient as IdentityClient,
      billiardTablesClient as BilliardTablesClient,
      bookingClient as BookingClient,
    );
  });

  it('returns available tables with total cost for requested type and interval', async () => {
    const startTime = new Date(Date.now() + 60 * 60 * 1000);
    const endTime = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const getTablesMock = billiardTablesClient.getTables as jest.MockedFunction<
      BilliardTablesClient['getTables']
    >;
    const getBusyTableIdsMock =
      bookingClient.getBusyBilliardTableIdsInRange as jest.MockedFunction<
        BookingClient['getBusyBilliardTableIdsInRange']
      >;

    getTablesMock.mockResolvedValue([
      {
        id: 'table-1',
        title: 'Table 1',
        description: '',
        type: BilliardTableType.POOL,
        status: BilliardTableStatus.Available,
        hourlyPrice: 1200,
        photos: [],
      },
      {
        id: 'table-2',
        title: 'Table 2',
        description: '',
        type: BilliardTableType.POOL,
        status: BilliardTableStatus.Available,
        hourlyPrice: 900,
        photos: [],
      },
    ]);
    getBusyTableIdsMock.mockResolvedValue(['table-1']);

    const result = await controller.getAvailableTables({
      type: BilliardTableType.POOL,
      startTime,
      endTime,
    });

    expect(billiardTablesClient.getTables).toHaveBeenCalledWith({
      type: BilliardTableType.POOL,
      status: BilliardTableStatus.Available,
    });
    expect(bookingClient.getBusyBilliardTableIdsInRange).toHaveBeenCalledWith({
      tableIds: ['table-1', 'table-2'],
      startTime,
      endTime,
    });
    expect(result).toEqual([
      {
        id: 'table-2',
        title: 'Table 2',
        type: BilliardTableType.POOL,
        hourlyPrice: 900,
        totalCost: 1800,
      },
    ]);
  });

  it('forbids a user from reading another user booking by id', async () => {
    const getBookingByIdMock = bookingClient.getById as jest.MockedFunction<
      BookingClient['getById']
    >;

    getBookingByIdMock.mockResolvedValue({
      id: 'booking-1',
      userId: 'user-1',
      billiardTableId: 'table-1',
      status: BookingStatus.Pending,
      startTime: new Date(),
      endTime: new Date(),
      totalCost: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      controller.getById('booking-1', {
        user: { id: 'user-2', role: UserRole.User },
      } as RequestWithUser),
    ).rejects.toThrow(ForbiddenException);
  });
});
