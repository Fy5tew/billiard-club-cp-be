import type { FindManyOptions, Repository } from 'typeorm';
import { FindOperator } from 'typeorm';

import { BookingStatus } from '@app/shared/dtos/booking.dto';
import type { BookingEntity } from '@app/shared/entities/booking.entity';

import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  let bookingsRepository: jest.Mocked<Partial<Repository<BookingEntity>>>;

  beforeEach(() => {
    bookingsRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    service = new BookingService(
      bookingsRepository as Repository<BookingEntity>,
    );
  });

  it('queries upcoming bookings by intersection with the rest of current day', async () => {
    await service.getUpcomingBookings();

    expect(bookingsRepository.find).toHaveBeenCalledTimes(1);

    const findMock = bookingsRepository.find as jest.Mock<
      Promise<BookingEntity[]>,
      [FindManyOptions<BookingEntity>?]
    >;
    const findArgument = findMock.mock.calls[0]?.[0];

    if (!findArgument?.where || Array.isArray(findArgument.where)) {
      throw new Error(
        'Expected object-based where clause for upcoming bookings',
      );
    }

    expect(findArgument.order).toEqual({ startTime: 'ASC' });
    expect(
      (findArgument.where as Record<string, unknown>).status,
    ).toBeInstanceOf(FindOperator);
    expect(
      (findArgument.where as Record<string, unknown>).startTime,
    ).toBeInstanceOf(FindOperator);
    expect(
      (findArgument.where as Record<string, unknown>).endTime,
    ).toBeInstanceOf(FindOperator);

    expect(
      (findArgument.where as Record<string, FindOperator<unknown>>).status.type,
    ).toBe('in');
    expect(
      (findArgument.where as Record<string, FindOperator<unknown>>).startTime
        .type,
    ).toBe('lessThanOrEqual');
    expect(
      (findArgument.where as Record<string, FindOperator<unknown>>).endTime
        .type,
    ).toBe('moreThan');
    expect(
      (findArgument.where as Record<string, FindOperator<BookingStatus[]>>)
        .status.value,
    ).toEqual([BookingStatus.Confirmed, BookingStatus.Paid]);
  });
});
