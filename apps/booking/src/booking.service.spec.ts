import type { Repository, SelectQueryBuilder } from 'typeorm';

import { BookingStatus } from '@app/shared/dtos/booking.dto';
import type { BookingEntity } from '@app/shared/entities/booking.entity';

import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  let bookingsRepository: jest.Mocked<Partial<Repository<BookingEntity>>>;

  beforeEach(() => {
    bookingsRepository = {
      find: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn(),
    };

    service = new BookingService(
      bookingsRepository as Repository<BookingEntity>,
    );
  });

  const getFutureBookingRange = () => {
    const startTime = new Date();
    startTime.setUTCDate(startTime.getUTCDate() + 1);
    startTime.setUTCHours(10, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setUTCHours(12, 0, 0, 0);

    return { startTime, endTime };
  };

  it('returns busy billiard table ids by active booking overlap', async () => {
    const { startTime, endTime } = getFutureBookingRange();
    const selectMock = jest.fn().mockReturnThis();
    const whereMock = jest.fn().mockReturnThis();
    const andWhereMock = jest.fn().mockReturnThis();
    const getRawManyMock = jest
      .fn()
      .mockResolvedValue([
        { billiardTableId: 'table-1' },
        { billiardTableId: 'table-3' },
      ]);
    const queryBuilder = {
      select: selectMock,
      where: whereMock,
      andWhere: andWhereMock,
      getRawMany: getRawManyMock,
    } as unknown as jest.Mocked<SelectQueryBuilder<BookingEntity>>;

    bookingsRepository.createQueryBuilder = jest
      .fn()
      .mockReturnValue(queryBuilder);

    const result = await service.getBusyBilliardTableIdsInRange({
      tableIds: ['table-1', 'table-2', 'table-3'],
      startTime,
      endTime,
    });

    expect(result).toEqual(['table-1', 'table-3']);
    expect(bookingsRepository.createQueryBuilder).toHaveBeenCalledWith(
      'booking',
    );
    expect(selectMock).toHaveBeenCalledWith(
      'DISTINCT booking.billiardTableId',
      'billiardTableId',
    );
    expect(whereMock).toHaveBeenCalledWith(
      'booking.billiardTableId IN (:...tableIds)',
      { tableIds: ['table-1', 'table-2', 'table-3'] },
    );
    expect(andWhereMock).toHaveBeenCalledWith(
      'booking.status NOT IN (:...excludedStatuses)',
      {
        excludedStatuses: [BookingStatus.Cancelled, BookingStatus.Rejected],
      },
    );
    expect(andWhereMock).toHaveBeenCalledWith('booking.startTime < :endTime', {
      endTime,
    });
    expect(andWhereMock).toHaveBeenCalledWith('booking.endTime > :startTime', {
      startTime,
    });
  });

  it('does not query busy billiard table ids when no table ids are provided', async () => {
    const { startTime, endTime } = getFutureBookingRange();

    const result = await service.getBusyBilliardTableIdsInRange({
      tableIds: [],
      startTime,
      endTime,
    });

    expect(result).toEqual([]);
    expect(bookingsRepository.createQueryBuilder).not.toHaveBeenCalled();
  });
});
