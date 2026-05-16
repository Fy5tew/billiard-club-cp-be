import { BadRequestException, ConflictException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { FindOperator } from 'typeorm';

import { TournamentBracketStatus } from '@app/shared/dtos/tournament-bracket.dto';
import { TournamentRegistrationStatus } from '@app/shared/dtos/tournament-registration.dto';
import { TournamentStatus } from '@app/shared/dtos/tournament.dto';
import type { TournamentBracketEntity } from '@app/shared/entities/tournament-bracket.entity';
import type { TournamentMatchEntity } from '@app/shared/entities/tournament-match.entity';
import type { TournamentRegistrationEntity } from '@app/shared/entities/tournament-registration.entity';
import type { TournamentEntity } from '@app/shared/entities/tournament.entity';

import { TournamentsService } from './tournaments.service';

type MockRepository<T extends { id: string }> = {
  items: T[];
  create: jest.Mock<T, [Partial<T>]>;
  count: jest.Mock<Promise<number>, [options?: { where?: Partial<T> }]>;
  find: jest.Mock<Promise<T[]>, [options?: { where?: Partial<T> }]>;
  findOne: jest.Mock<Promise<T | null>, [options?: { where?: Partial<T> }]>;
  save: jest.Mock<Promise<T | T[]>, [value: T | T[]]>;
  createQueryBuilder: jest.Mock;
  upsert(item: T): void;
};

const createRepository = <T extends { id: string }>(
  initialItems: T[] = [],
): MockRepository<T> => {
  const matchesWhere = (item: T, where: Partial<T> = {}) => {
    return Object.entries(where).every(([key, value]) => {
      const itemValue = item[key as keyof T];

      if (value instanceof FindOperator && value.type === 'in') {
        return (value.value as unknown[]).includes(itemValue);
      }

      return itemValue === value;
    });
  };
  const repository: MockRepository<T> = {
    items: [...initialItems],
    create: jest.fn((data: Partial<T>) => data as T),
    count: jest.fn(({ where }: { where?: Partial<T> } = {}) =>
      Promise.resolve(
        repository.items.filter((item) => matchesWhere(item, where)).length,
      ),
    ),
    find: jest.fn(({ where }: { where?: Partial<T> } = {}) =>
      Promise.resolve(
        repository.items.filter((item) => matchesWhere(item, where)),
      ),
    ),
    findOne: jest.fn(({ where }: { where?: Partial<T> } = {}) =>
      Promise.resolve(
        repository.items.find((item) => matchesWhere(item, where)) ?? null,
      ),
    ),
    save: jest.fn((value: T | T[]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => repository.upsert(item));
        return Promise.resolve(value);
      }

      repository.upsert(value);
      return Promise.resolve(value);
    }),
    createQueryBuilder: jest.fn(),
    upsert: (item: T) => {
      const index = repository.items.findIndex(
        (current) => current.id === item.id,
      );

      if (index === -1) {
        repository.items.push(item);
        return;
      }

      repository.items[index] = item;
    },
  };

  return repository;
};

const createTournament = (
  status = TournamentStatus.InProgress,
): TournamentEntity =>
  ({
    id: 'tournament-1',
    title: 'Spring Cup',
    description: null,
    startAt: new Date(Date.now() - 60_000),
    endAt: new Date(Date.now() + 60_000),
    registrationDeadline: new Date(Date.now() - 120_000),
    maxParticipants: 16,
    entryFee: 0,
    status,
    format: null,
    rules: null,
    prizeDescription: null,
    publishedAt: new Date(),
  }) as TournamentEntity;

const createRegistration = (
  id: string,
  userId: string,
  status: TournamentRegistrationStatus,
): TournamentRegistrationEntity =>
  ({
    id,
    tournamentId: 'tournament-1',
    userId,
    status,
    createdAt: new Date(),
  }) as TournamentRegistrationEntity;

describe('TournamentsService bracket lifecycle', () => {
  let tournaments: MockRepository<TournamentEntity>;
  let registrations: MockRepository<TournamentRegistrationEntity>;
  let brackets: MockRepository<TournamentBracketEntity>;
  let matches: MockRepository<TournamentMatchEntity>;
  let service: TournamentsService;

  beforeEach(() => {
    tournaments = createRepository([createTournament()]);
    registrations = createRepository();
    brackets = createRepository();
    matches = createRepository();

    service = new TournamentsService(
      tournaments as unknown as Repository<TournamentEntity>,
      registrations as unknown as Repository<TournamentRegistrationEntity>,
      brackets as unknown as Repository<TournamentBracketEntity>,
      matches as unknown as Repository<TournamentMatchEntity>,
    );
  });

  it('allows attendance to be reset to Approved while bracket seeding is not fixed', async () => {
    registrations.items.push(
      createRegistration(
        'registration-1',
        'user-1',
        TournamentRegistrationStatus.Attended,
      ),
    );
    brackets.items.push({
      id: 'bracket-1',
      tournamentId: 'tournament-1',
      size: 2,
      status: TournamentBracketStatus.Seeding,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as TournamentBracketEntity);

    const result = await service.updateParticipantAttendance(
      'tournament-1',
      'registration-1',
      TournamentRegistrationStatus.Approved,
    );

    expect(result.status).toBe(TournamentRegistrationStatus.Approved);
    expect(registrations.items[0].status).toBe(
      TournamentRegistrationStatus.Approved,
    );
  });

  it('rejects attendance changes after bracket seeding is confirmed', async () => {
    registrations.items.push(
      createRegistration(
        'registration-1',
        'user-1',
        TournamentRegistrationStatus.Approved,
      ),
    );
    brackets.items.push({
      id: 'bracket-1',
      tournamentId: 'tournament-1',
      size: 2,
      status: TournamentBracketStatus.Active,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as TournamentBracketEntity);

    await expect(
      service.updateParticipantAttendance(
        'tournament-1',
        'registration-1',
        TournamentRegistrationStatus.Attended,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects bracket creation while an approved participant is not marked', async () => {
    registrations.items.push(
      createRegistration(
        'registration-1',
        'user-1',
        TournamentRegistrationStatus.Approved,
      ),
      createRegistration(
        'registration-2',
        'user-2',
        TournamentRegistrationStatus.Attended,
      ),
      createRegistration(
        'registration-3',
        'user-3',
        TournamentRegistrationStatus.Attended,
      ),
    );

    await expect(service.createBracket('tournament-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('creates a power-of-two seeding bracket from attended participants only', async () => {
    registrations.items.push(
      createRegistration(
        'registration-1',
        'user-1',
        TournamentRegistrationStatus.Attended,
      ),
      createRegistration(
        'registration-2',
        'user-2',
        TournamentRegistrationStatus.Attended,
      ),
      createRegistration(
        'registration-3',
        'user-3',
        TournamentRegistrationStatus.Attended,
      ),
      createRegistration(
        'registration-4',
        'user-4',
        TournamentRegistrationStatus.NoShow,
      ),
    );

    const bracket = await service.createBracket('tournament-1');

    expect(bracket.size).toBe(4);
    expect(bracket.status).toBe(TournamentBracketStatus.Seeding);
    expect(matches.items).toHaveLength(3);

    const firstRoundUserIds = matches.items
      .filter((match) => match.roundIndex === 1)
      .flatMap((match) => [match.participantAUserId, match.participantBUserId])
      .filter(Boolean);
    const hasEmptyFirstRoundMatch = matches.items
      .filter((match) => match.roundIndex === 1)
      .some((match) => !match.participantAUserId && !match.participantBUserId);

    expect(firstRoundUserIds.sort()).toEqual(['user-1', 'user-2', 'user-3']);
    expect(firstRoundUserIds).not.toContain('user-4');
    expect(hasEmptyFirstRoundMatch).toBe(false);
  });

  it('distributes bye slots across the first round instead of grouping them at one end', async () => {
    registrations.items.push(
      createRegistration(
        'registration-1',
        'user-1',
        TournamentRegistrationStatus.Attended,
      ),
      createRegistration(
        'registration-2',
        'user-2',
        TournamentRegistrationStatus.Attended,
      ),
      createRegistration(
        'registration-3',
        'user-3',
        TournamentRegistrationStatus.Attended,
      ),
      createRegistration(
        'registration-4',
        'user-4',
        TournamentRegistrationStatus.Attended,
      ),
      createRegistration(
        'registration-5',
        'user-5',
        TournamentRegistrationStatus.Attended,
      ),
    );

    await service.createBracket('tournament-1');

    const firstRound = matches.items
      .filter((match) => match.roundIndex === 1)
      .sort((first, second) => first.matchIndex - second.matchIndex);
    const byeMatchIndices = firstRound
      .filter(
        (match) =>
          (match.participantAUserId && !match.participantBUserId) ||
          (!match.participantAUserId && match.participantBUserId),
      )
      .map((match) => match.matchIndex);

    expect(byeMatchIndices).toEqual([2, 3, 4]);
  });

  it('builds stable seeding layouts for bracket sizes up to 32', () => {
    const bracketInternals = service as unknown as {
      getBracketSeedOrder(bracketSize: number): number[];
      buildFirstRoundSlots(
        userIds: string[],
        bracketSize: number,
      ): Array<string | null>;
    };
    const getExpectedSeedOrder = (bracketSize: number): number[] => {
      if (bracketSize === 2) {
        return [1, 2];
      }

      const previousSeedOrder = getExpectedSeedOrder(bracketSize / 2);
      const nextSeedOrder: number[] = [];

      previousSeedOrder.forEach((seedNumber) => {
        nextSeedOrder.push(seedNumber, bracketSize + 1 - seedNumber);
      });

      return nextSeedOrder;
    };

    const buildExpectedSlots = (
      count: number,
      bracketSize: number,
    ): Array<string | null> => {
      const userIds = Array.from(
        { length: count },
        (_, index) => `user-${index + 1}`,
      );
      const slots: Array<string | null> = [];

      for (let index = 0; index < bracketSize; index += 1) {
        slots.push(null);
      }

      const seedOrder = getExpectedSeedOrder(bracketSize);

      userIds.forEach((userId, index) => {
        const seedNumber = seedOrder[index];

        if (seedNumber === undefined) {
          return;
        }

        slots[seedNumber - 1] = userId;
      });

      return slots;
    };

    for (const bracketSize of [2, 4, 8, 16, 32]) {
      expect(bracketInternals.getBracketSeedOrder(bracketSize)).toEqual(
        getExpectedSeedOrder(bracketSize),
      );

      for (let count = 2; count <= bracketSize; count += 1) {
        const userIds = Array.from(
          { length: count },
          (_, index) => `user-${index + 1}`,
        );
        const slots = bracketInternals.buildFirstRoundSlots(
          userIds,
          bracketSize,
        );

        expect(slots).toEqual(buildExpectedSlots(count, bracketSize));
        expect(slots.filter(Boolean)).toHaveLength(count);
        expect(slots.filter((slot) => slot === null)).toHaveLength(
          bracketSize - count,
        );
      }
    }
  });

  it('allows manager manual registration after registration deadline before tournament start', async () => {
    tournaments.items[0] = {
      ...createTournament(TournamentStatus.RegistrationClosed),
      startAt: new Date(Date.now() + 60_000),
      endAt: new Date(Date.now() + 120_000),
      registrationDeadline: new Date(Date.now() - 60_000),
    } as TournamentEntity;

    const result = await service.registerManual('tournament-1', {
      userId: 'user-5',
    });

    expect(result.status).toBe(TournamentRegistrationStatus.Approved);
    expect(registrations.items[0]).toMatchObject({
      tournamentId: 'tournament-1',
      userId: 'user-5',
      status: TournamentRegistrationStatus.Approved,
    });
  });

  it('rejects tournament completion before the final match is completed', async () => {
    brackets.items.push({
      id: 'bracket-1',
      tournamentId: 'tournament-1',
      size: 2,
      status: TournamentBracketStatus.Active,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as TournamentBracketEntity);
    matches.items.push({
      id: 'match-1',
      tournamentId: 'tournament-1',
      bracketId: 'bracket-1',
      roundIndex: 1,
      matchIndex: 1,
      participantAUserId: 'user-1',
      participantBUserId: 'user-2',
      winnerUserId: null,
      loserUserId: null,
      scoreA: null,
      scoreB: null,
      status: 'Ready',
      winReason: null,
      nextMatchId: null,
      nextSlot: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as TournamentMatchEntity);

    await expect(service.completeById('tournament-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects creating a second bracket for the same tournament', async () => {
    brackets.items.push({
      id: 'bracket-1',
      tournamentId: 'tournament-1',
      size: 2,
      status: TournamentBracketStatus.Seeding,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as TournamentBracketEntity);

    await expect(service.createBracket('tournament-1')).rejects.toThrow(
      ConflictException,
    );
  });
});
