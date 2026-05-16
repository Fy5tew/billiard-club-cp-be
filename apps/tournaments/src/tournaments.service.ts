import { randomUUID } from 'crypto';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';

import {
  SetTournamentMatchResultDto,
  TournamentBracketDto,
  TournamentBracketStatus,
  TournamentLeaderboardItemDto,
  TournamentMatchDto,
  TournamentMatchId,
  TournamentMatchSlot,
  TournamentMatchStatus,
  TournamentMatchWinReason,
  UpdateTournamentBracketSeedingDto,
} from '@app/shared/dtos/tournament-bracket.dto';
import { TournamentParticipantDto } from '@app/shared/dtos/tournament-participant.dto';
import {
  CreateTournamentRegistrationManualDto,
  TournamentRegistrationDto,
  TournamentRegistrationId,
  TournamentRegistrationStatus,
} from '@app/shared/dtos/tournament-registration.dto';
import {
  TournamentDto,
  TournamentId,
  TournamentStatus,
  CreateTournamentDto,
  GetTournamentsQueryDto,
  UpdateTournamentDto,
} from '@app/shared/dtos/tournament.dto';
import type { UserId } from '@app/shared/dtos/user.dto';
import { TournamentBracketEntity } from '@app/shared/entities/tournament-bracket.entity';
import { TournamentMatchEntity } from '@app/shared/entities/tournament-match.entity';
import { TournamentRegistrationEntity } from '@app/shared/entities/tournament-registration.entity';
import { TournamentEntity } from '@app/shared/entities/tournament.entity';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(TournamentEntity)
    private readonly tournaments: Repository<TournamentEntity>,
    @InjectRepository(TournamentRegistrationEntity)
    private readonly registrations: Repository<TournamentRegistrationEntity>,
    @InjectRepository(TournamentBracketEntity)
    private readonly brackets: Repository<TournamentBracketEntity>,
    @InjectRepository(TournamentMatchEntity)
    private readonly matches: Repository<TournamentMatchEntity>,
  ) {}

  async create(data: CreateTournamentDto): Promise<TournamentDto> {
    this.validateTournamentDates(data);

    const entity = this.tournaments.create({
      ...data,
      description: data.description ?? null,
      format: data.format ?? null,
      rules: data.rules ?? null,
      prizeDescription: data.prizeDescription ?? null,
      publishedAt: null,
      status: TournamentStatus.Draft,
    });

    return this.mapTournamentToDto(await this.tournaments.save(entity));
  }

  async updateById(
    id: TournamentId,
    data: UpdateTournamentDto,
  ): Promise<TournamentDto> {
    const tournament = await this.getTournamentEntityById(id, false);

    if (
      [
        TournamentStatus.InProgress,
        TournamentStatus.Completed,
        TournamentStatus.Cancelled,
      ].includes(tournament.status)
    ) {
      throw new BadRequestException(
        'Only draft and published tournaments can be updated',
      );
    }

    this.ensureTournamentHasNotStarted(tournament);

    const nextState = {
      ...tournament,
      ...data,
      description:
        data.description !== undefined
          ? data.description
          : tournament.description,
      format: data.format !== undefined ? data.format : tournament.format,
      rules: data.rules !== undefined ? data.rules : tournament.rules,
      prizeDescription:
        data.prizeDescription !== undefined
          ? data.prizeDescription
          : tournament.prizeDescription,
    };

    this.validateTournamentDates(nextState);

    const approvedCount = await this.getApprovedRegistrationsCount(id);
    if (nextState.maxParticipants < approvedCount) {
      throw new ConflictException(
        'Max participants cannot be less than approved registrations',
      );
    }

    Object.assign(tournament, nextState);
    await this.tournaments.save(tournament);
    await this.syncTournamentRegistrationState(id);

    return this.mapTournamentToDto(
      await this.getTournamentEntityById(id, false),
    );
  }

  async getById(id: TournamentId): Promise<TournamentDto> {
    return this.mapTournamentToDto(
      await this.getTournamentEntityById(id, true),
    );
  }

  async getList(query: GetTournamentsQueryDto = {}): Promise<TournamentDto[]> {
    const entities = await this.buildListQuery(query, true).getMany();

    return Promise.all(
      entities.map((entity) => this.mapTournamentToDto(entity)),
    );
  }

  async getByIdPrivate(id: TournamentId): Promise<TournamentDto> {
    return this.mapTournamentToDto(
      await this.getTournamentEntityById(id, false),
    );
  }

  async getListPrivate(
    query: GetTournamentsQueryDto = {},
  ): Promise<TournamentDto[]> {
    const entities = await this.buildListQuery(query, false).getMany();

    return Promise.all(
      entities.map((entity) => this.mapTournamentToDto(entity)),
    );
  }

  async publishById(id: TournamentId): Promise<TournamentDto> {
    const tournament = await this.getTournamentEntityById(id, false);

    if (tournament.status !== TournamentStatus.Draft) {
      throw new BadRequestException('Only draft tournaments can be published');
    }

    this.validateTournamentDates(tournament);
    this.ensureTournamentHasNotStarted(tournament);

    tournament.status = TournamentStatus.Published;
    tournament.publishedAt = new Date();

    await this.tournaments.save(tournament);
    await this.syncTournamentRegistrationState(id);

    return this.mapTournamentToDto(
      await this.getTournamentEntityById(id, false),
    );
  }

  async closeRegistrationById(id: TournamentId): Promise<TournamentDto> {
    const tournament = await this.getTournamentEntityById(id, false);

    if (tournament.status !== TournamentStatus.Published) {
      throw new BadRequestException(
        'Only published tournaments can close registration',
      );
    }

    this.ensureTournamentHasNotStarted(tournament);

    tournament.status = TournamentStatus.RegistrationClosed;

    return this.mapTournamentToDto(await this.tournaments.save(tournament));
  }

  async openRegistrationById(id: TournamentId): Promise<TournamentDto> {
    const tournament = await this.getTournamentEntityById(id, false);

    if (tournament.status !== TournamentStatus.RegistrationClosed) {
      throw new BadRequestException(
        'Only registration-closed tournaments can open registration',
      );
    }

    this.ensureRegistrationIsOpen(tournament);

    tournament.status = TournamentStatus.Published;

    return this.mapTournamentToDto(await this.tournaments.save(tournament));
  }

  async cancelById(id: TournamentId): Promise<TournamentDto> {
    const tournament = await this.getTournamentEntityById(id, false);

    if (
      [TournamentStatus.Completed, TournamentStatus.Cancelled].includes(
        tournament.status,
      )
    ) {
      throw new BadRequestException('Tournament cannot be cancelled');
    }

    tournament.status = TournamentStatus.Cancelled;
    await this.tournaments.save(tournament);

    const registrations = await this.registrations.find({
      where: {
        tournamentId: id,
        status: In([
          TournamentRegistrationStatus.Pending,
          TournamentRegistrationStatus.Approved,
        ]),
      },
    });

    if (registrations.length > 0) {
      registrations.forEach((registration) => {
        registration.status = TournamentRegistrationStatus.Rejected;
      });
      await this.registrations.save(registrations);
    }

    return this.mapTournamentToDto(tournament);
  }

  async startById(id: TournamentId): Promise<TournamentDto> {
    const tournament = await this.getTournamentEntityById(id, false);

    if (
      ![
        TournamentStatus.Published,
        TournamentStatus.RegistrationClosed,
      ].includes(tournament.status)
    ) {
      throw new BadRequestException('Tournament cannot be started');
    }

    if (new Date() < new Date(tournament.startAt)) {
      throw new BadRequestException('Tournament cannot start before startAt');
    }

    tournament.status = TournamentStatus.InProgress;
    return this.mapTournamentToDto(await this.tournaments.save(tournament));
  }

  async completeById(id: TournamentId): Promise<TournamentDto> {
    const tournament = await this.getTournamentEntityById(id, false);

    if (tournament.status !== TournamentStatus.InProgress) {
      throw new BadRequestException(
        'Only in-progress tournaments can be completed',
      );
    }

    const bracket = await this.getBracketEntityByTournamentId(id);

    if (!bracket || bracket.status !== TournamentBracketStatus.Active) {
      throw new BadRequestException(
        'Нельзя завершить турнир до завершения финального матча.',
      );
    }

    const finalMatch = await this.getFinalMatchEntity(bracket.id);

    if (
      !finalMatch ||
      finalMatch.status !== TournamentMatchStatus.Completed ||
      !finalMatch.winnerUserId
    ) {
      throw new BadRequestException(
        'Нельзя завершить турнир до завершения финального матча.',
      );
    }

    tournament.status = TournamentStatus.Completed;
    bracket.status = TournamentBracketStatus.Completed;
    await this.brackets.save(bracket);

    return this.mapTournamentToDto(await this.tournaments.save(tournament));
  }

  async register(
    tournamentId: TournamentId,
    userId: UserId,
  ): Promise<TournamentRegistrationDto> {
    const tournament = await this.getTournamentEntityById(tournamentId, false);

    if (tournament.status !== TournamentStatus.Published) {
      throw new BadRequestException('Tournament registration is closed');
    }

    this.ensureRegistrationIsOpen(tournament);

    const existingRegistration = await this.registrations.findOne({
      where: {
        tournamentId,
        userId,
      },
    });

    if (existingRegistration) {
      if (
        existingRegistration.status === TournamentRegistrationStatus.Cancelled
      ) {
        existingRegistration.status = TournamentRegistrationStatus.Pending;

        const savedRegistration =
          await this.registrations.save(existingRegistration);
        await this.syncTournamentRegistrationState(tournamentId);

        return this.mapRegistrationToDto(savedRegistration);
      }

      throw new ConflictException(
        'User already has a registration for this tournament',
      );
    }

    const approvedCount =
      await this.getApprovedRegistrationsCount(tournamentId);
    if (approvedCount >= tournament.maxParticipants) {
      throw new ConflictException('Tournament participant limit reached');
    }

    const registration = this.registrations.create({
      tournamentId,
      userId,
      status: TournamentRegistrationStatus.Pending,
    });

    const savedRegistration = await this.registrations.save(registration);
    await this.syncTournamentRegistrationState(tournamentId);

    return this.mapRegistrationToDto(savedRegistration);
  }

  async registerManual(
    tournamentId: TournamentId,
    { userId }: CreateTournamentRegistrationManualDto,
  ): Promise<TournamentRegistrationDto> {
    const tournament = await this.getTournamentEntityById(tournamentId, false);

    if (
      ![
        TournamentStatus.Published,
        TournamentStatus.RegistrationClosed,
      ].includes(tournament.status)
    ) {
      throw new BadRequestException('Tournament registration is closed');
    }

    this.ensureTournamentHasNotStarted(tournament);

    const activeRegistration = await this.registrations.findOne({
      where: {
        tournamentId,
        userId,
      },
    });

    if (activeRegistration) {
      throw new ConflictException(
        'User already has a registration for this tournament',
      );
    }

    const approvedCount =
      await this.getApprovedRegistrationsCount(tournamentId);
    if (approvedCount >= tournament.maxParticipants) {
      throw new ConflictException('Tournament participant limit reached');
    }

    const registration = this.registrations.create({
      tournamentId,
      userId,
    });

    registration.status = TournamentRegistrationStatus.Approved;

    const savedRegistration = await this.registrations.save(registration);
    await this.syncTournamentRegistrationState(tournamentId);

    return this.mapRegistrationToDto(savedRegistration);
  }

  async cancelRegistration(
    id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    const registration = await this.getRegistrationEntityById(id);
    const tournament = await this.getTournamentEntityById(
      registration.tournamentId,
      false,
    );

    this.ensureRegistrationCanBeChanged(tournament);
    this.ensureRegistrationTransition(
      registration.status,
      TournamentRegistrationStatus.Cancelled,
    );

    registration.status = TournamentRegistrationStatus.Cancelled;
    await this.registrations.save(registration);
    await this.syncTournamentRegistrationState(registration.tournamentId);

    return this.mapRegistrationToDto(registration);
  }

  async approve(
    id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    const registration = await this.getRegistrationEntityById(id);
    const tournament = await this.getTournamentEntityById(
      registration.tournamentId,
      false,
    );

    this.ensureRegistrationCanBeChanged(tournament);
    this.ensureRegistrationTransition(
      registration.status,
      TournamentRegistrationStatus.Approved,
    );

    const approvedCount = await this.getApprovedRegistrationsCount(
      registration.tournamentId,
    );
    if (approvedCount >= tournament.maxParticipants) {
      throw new ConflictException('Tournament participant limit reached');
    }

    registration.status = TournamentRegistrationStatus.Approved;
    await this.registrations.save(registration);
    await this.syncTournamentRegistrationState(registration.tournamentId);

    return this.mapRegistrationToDto(registration);
  }

  async reject(
    id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    const registration = await this.getRegistrationEntityById(id);
    const tournament = await this.getTournamentEntityById(
      registration.tournamentId,
      false,
    );

    this.ensureRegistrationCanBeChanged(tournament);
    this.ensureRegistrationTransition(
      registration.status,
      TournamentRegistrationStatus.Rejected,
    );

    registration.status = TournamentRegistrationStatus.Rejected;
    await this.registrations.save(registration);
    await this.syncTournamentRegistrationState(registration.tournamentId);

    return this.mapRegistrationToDto(registration);
  }

  async markAttended(
    id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return this.finalizeAttendance(id, TournamentRegistrationStatus.Attended);
  }

  async markNoShow(
    id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return this.finalizeAttendance(id, TournamentRegistrationStatus.NoShow);
  }

  async getByTournamentId(
    tournamentId: TournamentId,
  ): Promise<TournamentRegistrationDto[]> {
    await this.getTournamentEntityById(tournamentId, false);

    const registrations = await this.registrations.find({
      where: { tournamentId },
      order: { createdAt: 'ASC' },
    });
    const approvedRegistrationsCount =
      await this.getApprovedRegistrationsCount(tournamentId);

    return Promise.all(
      registrations.map((registration) =>
        this.mapRegistrationToDto(registration, approvedRegistrationsCount),
      ),
    );
  }

  async getByUserId(userId: UserId): Promise<TournamentRegistrationDto[]> {
    const registrations = await this.registrations.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      registrations.map((registration) =>
        this.mapRegistrationToDto(registration),
      ),
    );
  }

  async getParticipants(
    tournamentId: TournamentId,
  ): Promise<TournamentParticipantDto[]> {
    const tournament = await this.getTournamentEntityById(tournamentId, true);

    if (
      ![TournamentStatus.InProgress, TournamentStatus.Completed].includes(
        tournament.status,
      )
    ) {
      throw new BadRequestException(
        'Участники доступны только после старта турнира.',
      );
    }

    const registrations =
      await this.getParticipantRegistrationEntities(tournamentId);

    return registrations.map((registration) =>
      this.mapParticipantToDto(registration),
    );
  }

  async updateParticipantAttendance(
    tournamentId: TournamentId,
    registrationId: TournamentRegistrationId,
    status: TournamentRegistrationStatus,
  ): Promise<TournamentParticipantDto> {
    const tournament = await this.getTournamentEntityById(tournamentId, false);

    if (tournament.status !== TournamentStatus.InProgress) {
      throw new BadRequestException(
        'Изменять явку можно только во время турнира.',
      );
    }

    const bracket = await this.getBracketEntityByTournamentId(tournamentId);

    if (
      bracket &&
      [
        TournamentBracketStatus.Active,
        TournamentBracketStatus.Completed,
      ].includes(bracket.status)
    ) {
      throw new BadRequestException(
        'Нельзя изменить явку после фиксации сетки.',
      );
    }

    const registration = await this.getRegistrationEntityById(registrationId);

    if (registration.tournamentId !== tournamentId) {
      throw new NotFoundException(
        `Tournament registration with id '${registrationId}' not found`,
      );
    }

    this.ensureParticipantAttendanceTransition(registration.status, status);

    registration.status = status;
    await this.registrations.save(registration);

    return this.mapParticipantToDto(registration);
  }

  async getBracket(
    tournamentId: TournamentId,
  ): Promise<TournamentBracketDto | null> {
    await this.getTournamentEntityById(tournamentId, true);

    return this.mapBracketByTournamentId(tournamentId);
  }

  async createBracket(
    tournamentId: TournamentId,
  ): Promise<TournamentBracketDto> {
    const tournament = await this.getTournamentEntityById(tournamentId, false);

    if (tournament.status !== TournamentStatus.InProgress) {
      throw new BadRequestException(
        'Сетку можно создать только после старта турнира.',
      );
    }

    const existingBracket =
      await this.getBracketEntityByTournamentId(tournamentId);

    if (existingBracket) {
      throw new ConflictException('Сетка для этого турнира уже создана.');
    }

    const participantRegistrations =
      await this.getParticipantRegistrationEntities(tournamentId);
    const unmarkedCount = participantRegistrations.filter(
      ({ status }) => status === TournamentRegistrationStatus.Approved,
    ).length;

    if (unmarkedCount > 0) {
      throw new BadRequestException(
        'Нельзя создать сетку, пока не отмечена явка всех подтверждённых участников.',
      );
    }

    const attendedUserIds = participantRegistrations
      .filter(({ status }) => status === TournamentRegistrationStatus.Attended)
      .map(({ userId }) => userId);

    if (attendedUserIds.length < 2) {
      throw new BadRequestException(
        'Для создания сетки нужно минимум 2 явившихся участника.',
      );
    }

    const bracket = this.brackets.create({
      id: randomUUID(),
      tournamentId,
      size: this.nextPowerOfTwo(attendedUserIds.length),
      status: TournamentBracketStatus.Seeding,
    });
    const savedBracket = await this.brackets.save(bracket);

    await this.matches.save(
      this.createMatchEntities(
        tournamentId,
        savedBracket.id,
        savedBracket.size,
        this.shuffle(attendedUserIds),
      ),
    );

    return this.mapBracketByEntity(savedBracket);
  }

  async randomizeBracketSeeding(
    tournamentId: TournamentId,
  ): Promise<TournamentBracketDto> {
    const bracket = await this.getEditableBracket(tournamentId);
    const attendedUserIds = await this.getAttendedUserIds(tournamentId);

    await this.applySeedingSlots(bracket, this.shuffle(attendedUserIds));

    return this.mapBracketByEntity(bracket);
  }

  async updateBracketSeeding(
    tournamentId: TournamentId,
    data: UpdateTournamentBracketSeedingDto,
  ): Promise<TournamentBracketDto> {
    const bracket = await this.getEditableBracket(tournamentId);
    const matches = await this.getMatchesByBracketId(bracket.id);
    const firstRoundMatches = matches.filter((match) => match.roundIndex === 1);
    const firstRoundMatchIds = new Set(
      firstRoundMatches.map((match) => match.id),
    );
    const attendedUserIds = new Set(
      await this.getAttendedUserIds(tournamentId),
    );

    for (const { matchId, userId } of data.slots) {
      if (!firstRoundMatchIds.has(matchId)) {
        throw new BadRequestException(
          'Расстановку можно менять только в первом раунде.',
        );
      }

      if (userId && !attendedUserIds.has(userId)) {
        throw new BadRequestException(
          'В сетку можно добавить только явившегося участника турнира.',
        );
      }
    }

    for (const { matchId, slot, userId } of data.slots) {
      const match = firstRoundMatches.find((item) => item.id === matchId);

      if (!match) {
        continue;
      }

      this.setMatchSlot(match, slot, userId);
    }

    this.ensureNoDuplicateSeedingParticipants(firstRoundMatches);
    this.clearGeneratedBracketProgress(matches);
    await this.matches.save(matches);

    return this.mapBracketByEntity(bracket);
  }

  async confirmBracketSeeding(
    tournamentId: TournamentId,
  ): Promise<TournamentBracketDto> {
    const bracket = await this.getEditableBracket(tournamentId);
    const matches = await this.getMatchesByBracketId(bracket.id);
    const firstRoundMatches = matches.filter((match) => match.roundIndex === 1);
    const attendedUserIds = await this.getAttendedUserIds(tournamentId);

    this.ensureNoDuplicateSeedingParticipants(firstRoundMatches);
    this.ensureAllAttendedParticipantsSeeded(
      firstRoundMatches,
      attendedUserIds,
    );

    bracket.status = TournamentBracketStatus.Active;
    this.prepareActiveBracketMatches(matches);
    this.processAutomaticByeAdvancements(matches);

    await this.matches.save(matches);
    await this.brackets.save(bracket);

    return this.mapBracketByEntity(bracket);
  }

  async setMatchResult(
    tournamentId: TournamentId,
    matchId: TournamentMatchId,
    data: SetTournamentMatchResultDto,
  ): Promise<TournamentBracketDto> {
    const tournament = await this.getTournamentEntityById(tournamentId, false);

    if (tournament.status !== TournamentStatus.InProgress) {
      throw new BadRequestException(
        'Результаты можно указывать только во время турнира.',
      );
    }

    const bracket =
      await this.getRequiredBracketEntityByTournamentId(tournamentId);

    if (bracket.status !== TournamentBracketStatus.Active) {
      throw new BadRequestException(
        'Результаты можно указывать только после фиксации сетки.',
      );
    }

    const matches = await this.getMatchesByBracketId(bracket.id);
    const match = matches.find((item) => item.id === matchId);

    if (!match || match.tournamentId !== tournamentId) {
      throw new NotFoundException(
        `Tournament match with id '${matchId}' not found`,
      );
    }

    this.ensureMatchResultCanBeSet(match, data);
    this.completeMatchWithResult(match, data);
    this.advanceWinnerToNextMatch(match, matches);
    this.processAutomaticByeAdvancements(matches);

    await this.matches.save(matches);

    return this.mapBracketByEntity(bracket);
  }

  async getLeaderboard(
    tournamentId: TournamentId,
  ): Promise<TournamentLeaderboardItemDto[]> {
    const tournament = await this.getTournamentEntityById(tournamentId, true);

    if (tournament.status !== TournamentStatus.Completed) {
      throw new BadRequestException(
        'Таблица лидеров доступна только после завершения турнира.',
      );
    }

    const bracket =
      await this.getRequiredBracketEntityByTournamentId(tournamentId);
    const matches = await this.getMatchesByBracketId(bracket.id);

    return this.buildLeaderboard(bracket, matches);
  }

  private async finalizeAttendance(
    id: TournamentRegistrationId,
    nextStatus:
      | TournamentRegistrationStatus.Attended
      | TournamentRegistrationStatus.NoShow,
  ): Promise<TournamentRegistrationDto> {
    const registration = await this.getRegistrationEntityById(id);
    const participant = await this.updateParticipantAttendance(
      registration.tournamentId,
      id,
      nextStatus,
    );

    return this.mapRegistrationToDto({
      ...registration,
      status: participant.status,
    });
  }

  private async getParticipantRegistrationEntities(
    tournamentId: TournamentId,
  ): Promise<TournamentRegistrationEntity[]> {
    return this.registrations.find({
      where: {
        tournamentId,
        status: In([
          TournamentRegistrationStatus.Approved,
          TournamentRegistrationStatus.Attended,
          TournamentRegistrationStatus.NoShow,
        ]),
      },
      order: { createdAt: 'ASC' },
    });
  }

  private async getAttendedUserIds(
    tournamentId: TournamentId,
  ): Promise<UserId[]> {
    const registrations = await this.registrations.find({
      where: {
        tournamentId,
        status: TournamentRegistrationStatus.Attended,
      },
      order: { createdAt: 'ASC' },
    });

    return registrations.map(({ userId }) => userId);
  }

  private ensureParticipantAttendanceTransition(
    current: TournamentRegistrationStatus,
    next: TournamentRegistrationStatus,
  ): void {
    const attendanceStatuses = [
      TournamentRegistrationStatus.Approved,
      TournamentRegistrationStatus.Attended,
      TournamentRegistrationStatus.NoShow,
    ];

    if (
      !attendanceStatuses.includes(current) ||
      !attendanceStatuses.includes(next)
    ) {
      throw new BadRequestException('Недопустимый статус явки участника.');
    }
  }

  private async getEditableBracket(
    tournamentId: TournamentId,
  ): Promise<TournamentBracketEntity> {
    const tournament = await this.getTournamentEntityById(tournamentId, false);

    if (tournament.status !== TournamentStatus.InProgress) {
      throw new BadRequestException(
        'Расстановку можно менять только во время турнира.',
      );
    }

    const bracket =
      await this.getRequiredBracketEntityByTournamentId(tournamentId);

    if (bracket.status !== TournamentBracketStatus.Seeding) {
      throw new BadRequestException(
        'Расстановку можно менять только до фиксации сетки.',
      );
    }

    const matches = await this.getMatchesByBracketId(bracket.id);
    const hasCompletedMatch = matches.some(
      ({ status }) => status === TournamentMatchStatus.Completed,
    );

    if (hasCompletedMatch) {
      throw new BadRequestException(
        'Расстановку нельзя менять после завершения матчей.',
      );
    }

    return bracket;
  }

  private async applySeedingSlots(
    bracket: TournamentBracketEntity,
    userIds: UserId[],
  ): Promise<void> {
    const matches = await this.getMatchesByBracketId(bracket.id);
    const firstRoundMatches = matches
      .filter(({ roundIndex }) => roundIndex === 1)
      .sort((first, second) => first.matchIndex - second.matchIndex);
    const slots = this.buildFirstRoundSlots(userIds, bracket.size);

    firstRoundMatches.forEach((match, index) => {
      match.participantAUserId = slots[index * 2] ?? null;
      match.participantBUserId = slots[index * 2 + 1] ?? null;
    });

    this.clearGeneratedBracketProgress(matches);
    await this.matches.save(matches);
  }

  private createMatchEntities(
    tournamentId: TournamentId,
    bracketId: string,
    bracketSize: number,
    userIds: UserId[],
  ): TournamentMatchEntity[] {
    const matchesByRound: TournamentMatchEntity[][] = [];
    const roundsCount = Math.log2(bracketSize);
    const slots = this.buildFirstRoundSlots(userIds, bracketSize);

    for (let roundIndex = 1; roundIndex <= roundsCount; roundIndex += 1) {
      const matchesInRound = bracketSize / 2 ** roundIndex;
      const roundMatches: TournamentMatchEntity[] = [];

      for (let matchIndex = 1; matchIndex <= matchesInRound; matchIndex += 1) {
        const slotIndex = (matchIndex - 1) * 2;

        roundMatches.push(
          this.matches.create({
            id: randomUUID(),
            tournamentId,
            bracketId,
            roundIndex,
            matchIndex,
            participantAUserId:
              roundIndex === 1 ? (slots[slotIndex] ?? null) : null,
            participantBUserId:
              roundIndex === 1 ? (slots[slotIndex + 1] ?? null) : null,
            scoreA: null,
            scoreB: null,
            winnerUserId: null,
            loserUserId: null,
            status: TournamentMatchStatus.Pending,
            winReason: null,
            nextMatchId: null,
            nextSlot: null,
          }),
        );
      }

      matchesByRound.push(roundMatches);
    }

    for (let roundIndex = 1; roundIndex < roundsCount; roundIndex += 1) {
      const currentRoundMatches = matchesByRound[roundIndex - 1];
      const nextRoundMatches = matchesByRound[roundIndex];

      currentRoundMatches.forEach((match) => {
        const nextMatchIndex = Math.ceil(match.matchIndex / 2);
        const nextMatch = nextRoundMatches[nextMatchIndex - 1];

        match.nextMatchId = nextMatch.id;
        match.nextSlot =
          match.matchIndex % 2 === 1
            ? TournamentMatchSlot.A
            : TournamentMatchSlot.B;
      });
    }

    return matchesByRound.flat();
  }

  private buildFirstRoundSlots(
    userIds: UserId[],
    bracketSize: number,
  ): Array<UserId | null> {
    const slots: Array<UserId | null> = [];

    for (let index = 0; index < bracketSize; index += 1) {
      slots.push(null);
    }

    const seedOrder = this.getBracketSeedOrder(bracketSize);

    userIds.forEach((userId, index) => {
      const seedNumber = seedOrder[index];

      if (seedNumber === undefined) {
        return;
      }

      slots[seedNumber - 1] = userId;
    });

    return slots;
  }

  private getBracketSeedOrder(bracketSize: number): number[] {
    if (bracketSize === 2) {
      return [1, 2];
    }

    const previousSeedOrder = this.getBracketSeedOrder(bracketSize / 2);
    const nextSeedOrder: number[] = [];

    previousSeedOrder.forEach((seedNumber) => {
      nextSeedOrder.push(seedNumber, bracketSize + 1 - seedNumber);
    });

    return nextSeedOrder;
  }

  private prepareActiveBracketMatches(matches: TournamentMatchEntity[]): void {
    matches.forEach((match) => {
      const participantCount = this.getParticipantCount(match);

      match.scoreA = null;
      match.scoreB = null;
      match.winnerUserId = null;
      match.loserUserId = null;
      match.winReason = null;
      match.status =
        match.roundIndex === 1 && participantCount === 2
          ? TournamentMatchStatus.Ready
          : TournamentMatchStatus.Pending;
    });
  }

  private clearGeneratedBracketProgress(
    matches: TournamentMatchEntity[],
  ): void {
    matches.forEach((match) => {
      if (match.roundIndex > 1) {
        match.participantAUserId = null;
        match.participantBUserId = null;
      }

      match.scoreA = null;
      match.scoreB = null;
      match.winnerUserId = null;
      match.loserUserId = null;
      match.winReason = null;
      match.status = TournamentMatchStatus.Pending;
    });
  }

  private processAutomaticByeAdvancements(
    matches: TournamentMatchEntity[],
  ): void {
    let changed = true;

    while (changed) {
      changed = false;

      for (const match of this.sortMatches(matches)) {
        if (match.status === TournamentMatchStatus.Completed) {
          continue;
        }

        const participantCount = this.getParticipantCount(match);

        if (participantCount === 2) {
          if (match.status !== TournamentMatchStatus.Ready) {
            match.status = TournamentMatchStatus.Ready;
            changed = true;
          }

          continue;
        }

        if (!this.canResolveAutomaticBye(match, matches)) {
          continue;
        }

        match.status = TournamentMatchStatus.Completed;
        match.winReason = TournamentMatchWinReason.Bye;
        match.scoreA = null;
        match.scoreB = null;

        if (participantCount === 1) {
          match.winnerUserId =
            match.participantAUserId ?? match.participantBUserId;
          match.loserUserId = null;
          this.advanceWinnerToNextMatch(match, matches);
        }

        changed = true;
      }
    }
  }

  private canResolveAutomaticBye(
    match: TournamentMatchEntity,
    matches: TournamentMatchEntity[],
  ): boolean {
    const previousMatches = matches.filter(
      ({ nextMatchId }) => nextMatchId === match.id,
    );

    return (
      previousMatches.length === 0 ||
      previousMatches.every(
        ({ status }) => status === TournamentMatchStatus.Completed,
      )
    );
  }

  private advanceWinnerToNextMatch(
    match: TournamentMatchEntity,
    matches: TournamentMatchEntity[],
  ): void {
    if (!match.nextMatchId || !match.nextSlot || !match.winnerUserId) {
      return;
    }

    const nextMatch = matches.find(({ id }) => id === match.nextMatchId);

    if (!nextMatch) {
      return;
    }

    this.setMatchSlot(nextMatch, match.nextSlot, match.winnerUserId);
  }

  private completeMatchWithResult(
    match: TournamentMatchEntity,
    data: SetTournamentMatchResultDto,
  ): void {
    match.winnerUserId = data.winnerUserId;
    match.loserUserId =
      data.winnerUserId === match.participantAUserId
        ? match.participantBUserId
        : match.participantAUserId;
    match.scoreA = data.scoreA;
    match.scoreB = data.scoreB;
    match.status = TournamentMatchStatus.Completed;
    match.winReason = data.winReason ?? TournamentMatchWinReason.Normal;
  }

  private ensureMatchResultCanBeSet(
    match: TournamentMatchEntity,
    data: SetTournamentMatchResultDto,
  ): void {
    if (match.status !== TournamentMatchStatus.Ready) {
      throw new BadRequestException('Матч ещё не готов к указанию результата.');
    }

    if (!match.participantAUserId || !match.participantBUserId) {
      throw new BadRequestException(
        'Результат можно указать только для матча с двумя участниками.',
      );
    }

    if (
      ![match.participantAUserId, match.participantBUserId].includes(
        data.winnerUserId,
      )
    ) {
      throw new BadRequestException('Победитель должен быть участником матча.');
    }

    if (
      !Number.isInteger(data.scoreA) ||
      !Number.isInteger(data.scoreB) ||
      data.scoreA < 0 ||
      data.scoreB < 0
    ) {
      throw new BadRequestException(
        'Счёт должен быть целым числом больше или равным нулю.',
      );
    }

    if (data.scoreA === data.scoreB) {
      throw new BadRequestException('Ничья в матче запрещена.');
    }

    const winnerScore =
      data.winnerUserId === match.participantAUserId
        ? data.scoreA
        : data.scoreB;
    const loserScore =
      data.winnerUserId === match.participantAUserId
        ? data.scoreB
        : data.scoreA;

    if (winnerScore <= loserScore) {
      throw new BadRequestException('Победитель должен иметь больший счёт.');
    }
  }

  private ensureNoDuplicateSeedingParticipants(
    firstRoundMatches: TournamentMatchEntity[],
  ): void {
    const userIds = firstRoundMatches.flatMap(
      (match) =>
        [match.participantAUserId, match.participantBUserId].filter(
          Boolean,
        ) as UserId[],
    );
    const uniqueUserIds = new Set(userIds);

    if (uniqueUserIds.size !== userIds.length) {
      throw new BadRequestException(
        'Один участник не может находиться в сетке дважды.',
      );
    }
  }

  private ensureAllAttendedParticipantsSeeded(
    firstRoundMatches: TournamentMatchEntity[],
    attendedUserIds: UserId[],
  ): void {
    const seededUserIds = new Set(
      firstRoundMatches.flatMap(
        (match) =>
          [match.participantAUserId, match.participantBUserId].filter(
            Boolean,
          ) as UserId[],
      ),
    );

    if (seededUserIds.size !== attendedUserIds.length) {
      throw new BadRequestException(
        'Перед фиксацией сетки расставьте всех явившихся участников.',
      );
    }

    const hasMissingUser = attendedUserIds.some(
      (userId) => !seededUserIds.has(userId),
    );

    if (hasMissingUser) {
      throw new BadRequestException(
        'Перед фиксацией сетки расставьте всех явившихся участников.',
      );
    }
  }

  private buildLeaderboard(
    bracket: TournamentBracketEntity,
    matches: TournamentMatchEntity[],
  ): TournamentLeaderboardItemDto[] {
    const firstRoundParticipants = new Set(
      matches
        .filter(({ roundIndex }) => roundIndex === 1)
        .flatMap((match) => [
          match.participantAUserId,
          match.participantBUserId,
        ])
        .filter(Boolean) as UserId[],
    );
    const finalMatch = this.getFinalMatchFromMatches(matches);
    const stats = new Map<
      UserId,
      TournamentLeaderboardItemDto & {
        eliminationRound: number;
        sortName: string;
      }
    >();

    firstRoundParticipants.forEach((userId) => {
      stats.set(userId, {
        userId,
        place: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        scoreFor: 0,
        scoreAgainst: 0,
        scoreDiff: 0,
        eliminationRound: 0,
        sortName: userId,
      });
    });

    this.sortMatches(matches).forEach((match) => {
      if (
        match.status !== TournamentMatchStatus.Completed ||
        !match.winnerUserId
      ) {
        return;
      }

      const loserUserId = match.loserUserId;
      const winnerStats = stats.get(match.winnerUserId);

      if (
        match.winReason !== TournamentMatchWinReason.Bye &&
        match.participantAUserId &&
        match.participantBUserId &&
        match.scoreA !== null &&
        match.scoreB !== null
      ) {
        const participantAStats = stats.get(match.participantAUserId);
        const participantBStats = stats.get(match.participantBUserId);

        if (participantAStats && participantBStats) {
          participantAStats.matchesPlayed += 1;
          participantBStats.matchesPlayed += 1;
          participantAStats.scoreFor += match.scoreA;
          participantAStats.scoreAgainst += match.scoreB;
          participantBStats.scoreFor += match.scoreB;
          participantBStats.scoreAgainst += match.scoreA;
        }

        if (winnerStats) {
          winnerStats.wins += 1;
        }

        if (loserUserId) {
          const loserStats = stats.get(loserUserId);

          if (loserStats) {
            loserStats.losses += 1;
            loserStats.eliminationRound = match.roundIndex;
          }
        }
      } else if (loserUserId) {
        const loserStats = stats.get(loserUserId);

        if (loserStats) {
          loserStats.eliminationRound = match.roundIndex;
        }
      }
    });

    stats.forEach((item) => {
      item.scoreDiff = item.scoreFor - item.scoreAgainst;
    });

    if (finalMatch?.winnerUserId) {
      const winnerStats = stats.get(finalMatch.winnerUserId);

      if (winnerStats) {
        winnerStats.eliminationRound = finalMatch.roundIndex + 1;
      }
    }

    const sorted = [...stats.values()].sort((first, second) => {
      if (first.userId === finalMatch?.winnerUserId) {
        return -1;
      }

      if (second.userId === finalMatch?.winnerUserId) {
        return 1;
      }

      if (first.userId === finalMatch?.loserUserId) {
        return -1;
      }

      if (second.userId === finalMatch?.loserUserId) {
        return 1;
      }

      return (
        second.eliminationRound - first.eliminationRound ||
        second.wins - first.wins ||
        second.scoreDiff - first.scoreDiff ||
        second.scoreFor - first.scoreFor ||
        first.sortName.localeCompare(second.sortName)
      );
    });

    return sorted.map((item, index) => {
      item.place = index + 1;

      return plainToInstance(TournamentLeaderboardItemDto, item, {
        excludeExtraneousValues: true,
      });
    });
  }

  private setMatchSlot(
    match: TournamentMatchEntity,
    slot: TournamentMatchSlot,
    userId: UserId | null,
  ): void {
    if (slot === TournamentMatchSlot.A) {
      match.participantAUserId = userId;
      return;
    }

    match.participantBUserId = userId;
  }

  private getParticipantCount(match: TournamentMatchEntity): number {
    return [match.participantAUserId, match.participantBUserId].filter(Boolean)
      .length;
  }

  private nextPowerOfTwo(value: number): number {
    let power = 1;

    while (power < value) {
      power *= 2;
    }

    return power;
  }

  private shuffle<T>(items: T[]): T[] {
    const result = [...items];

    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [
        result[randomIndex],
        result[index],
      ];
    }

    return result;
  }

  private sortMatches(
    matches: TournamentMatchEntity[],
  ): TournamentMatchEntity[] {
    return [...matches].sort(
      (first, second) =>
        first.roundIndex - second.roundIndex ||
        first.matchIndex - second.matchIndex,
    );
  }

  private async getBracketEntityByTournamentId(
    tournamentId: TournamentId,
  ): Promise<TournamentBracketEntity | null> {
    return this.brackets.findOne({ where: { tournamentId } });
  }

  private async getRequiredBracketEntityByTournamentId(
    tournamentId: TournamentId,
  ): Promise<TournamentBracketEntity> {
    const bracket = await this.getBracketEntityByTournamentId(tournamentId);

    if (!bracket) {
      throw new NotFoundException('Сетка турнира не найдена.');
    }

    return bracket;
  }

  private async getMatchesByBracketId(
    bracketId: string,
  ): Promise<TournamentMatchEntity[]> {
    return this.matches.find({
      where: { bracketId },
      order: { roundIndex: 'ASC', matchIndex: 'ASC' },
    });
  }

  private async getFinalMatchEntity(
    bracketId: string,
  ): Promise<TournamentMatchEntity | null> {
    const matches = await this.getMatchesByBracketId(bracketId);

    return this.getFinalMatchFromMatches(matches);
  }

  private getFinalMatchFromMatches(
    matches: TournamentMatchEntity[],
  ): TournamentMatchEntity | null {
    return (
      matches
        .filter(({ nextMatchId }) => !nextMatchId)
        .sort((first, second) => second.roundIndex - first.roundIndex)[0] ??
      null
    );
  }

  private async mapBracketByTournamentId(
    tournamentId: TournamentId,
  ): Promise<TournamentBracketDto | null> {
    const bracket = await this.getBracketEntityByTournamentId(tournamentId);

    if (!bracket) {
      return null;
    }

    return this.mapBracketByEntity(bracket);
  }

  private async mapBracketByEntity(
    bracket: TournamentBracketEntity,
  ): Promise<TournamentBracketDto> {
    const matches = await this.getMatchesByBracketId(bracket.id);
    const rounds = [...new Set(matches.map(({ roundIndex }) => roundIndex))]
      .sort((first, second) => first - second)
      .map((roundIndex) => ({
        roundIndex,
        matches: this.sortMatches(
          matches.filter((match) => match.roundIndex === roundIndex),
        ).map((match) => this.mapMatchToDto(match)),
      }));

    return plainToInstance(
      TournamentBracketDto,
      {
        ...bracket,
        rounds,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private mapMatchToDto(entity: TournamentMatchEntity): TournamentMatchDto {
    return plainToInstance(TournamentMatchDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  private mapParticipantToDto(
    entity: TournamentRegistrationEntity,
  ): TournamentParticipantDto {
    return plainToInstance(
      TournamentParticipantDto,
      {
        registrationId: entity.id,
        tournamentId: entity.tournamentId,
        userId: entity.userId,
        status: entity.status,
        createdAt: entity.createdAt,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private validateTournamentDates(
    data: Pick<
      TournamentEntity,
      'startAt' | 'endAt' | 'registrationDeadline' | 'maxParticipants'
    >,
  ): void {
    if (new Date(data.startAt) >= new Date(data.endAt)) {
      throw new BadRequestException('startAt must be before endAt');
    }

    if (new Date(data.registrationDeadline) >= new Date(data.startAt)) {
      throw new BadRequestException(
        'registrationDeadline must be before startAt',
      );
    }

    if (data.maxParticipants < 1) {
      throw new BadRequestException(
        'maxParticipants must be greater than zero',
      );
    }
  }

  private ensureTournamentHasNotStarted(tournament: TournamentEntity): void {
    if (this.hasTournamentStarted(tournament)) {
      throw new BadRequestException('Tournament has already started');
    }
  }

  private ensureRegistrationIsOpen(tournament: TournamentEntity): void {
    if (this.hasTournamentStarted(tournament)) {
      throw new BadRequestException('Tournament has already started');
    }

    if (new Date() >= new Date(tournament.registrationDeadline)) {
      throw new BadRequestException('Tournament registration deadline passed');
    }
  }

  private ensureRegistrationCanBeChanged(tournament: TournamentEntity): void {
    if (this.hasTournamentStarted(tournament)) {
      throw new BadRequestException(
        'Registration cannot be changed after tournament start',
      );
    }

    if (
      [
        TournamentStatus.Cancelled,
        TournamentStatus.Completed,
        TournamentStatus.InProgress,
      ].includes(tournament.status)
    ) {
      throw new BadRequestException('Registration cannot be changed');
    }
  }

  private ensureRegistrationTransition(
    current: TournamentRegistrationStatus,
    next: TournamentRegistrationStatus,
  ): void {
    const allowedTransitions: Record<
      TournamentRegistrationStatus,
      TournamentRegistrationStatus[]
    > = {
      [TournamentRegistrationStatus.Pending]: [
        TournamentRegistrationStatus.Approved,
        TournamentRegistrationStatus.Rejected,
        TournamentRegistrationStatus.Cancelled,
      ],
      [TournamentRegistrationStatus.Approved]: [
        TournamentRegistrationStatus.Rejected,
        TournamentRegistrationStatus.Cancelled,
        TournamentRegistrationStatus.Attended,
        TournamentRegistrationStatus.NoShow,
      ],
      [TournamentRegistrationStatus.Rejected]: [
        TournamentRegistrationStatus.Approved,
      ],
      [TournamentRegistrationStatus.Cancelled]: [],
      [TournamentRegistrationStatus.Attended]: [],
      [TournamentRegistrationStatus.NoShow]: [],
    };

    if (!allowedTransitions[current].includes(next)) {
      throw new BadRequestException(
        `Invalid registration status transition from ${TournamentRegistrationStatus[current]} to ${TournamentRegistrationStatus[next]}`,
      );
    }
  }

  private hasTournamentStarted(tournament: TournamentEntity): boolean {
    return (
      [TournamentStatus.InProgress, TournamentStatus.Completed].includes(
        tournament.status,
      ) || new Date() >= new Date(tournament.startAt)
    );
  }

  private async syncTournamentRegistrationState(
    tournamentId: TournamentId,
  ): Promise<void> {
    const tournament = await this.getTournamentEntityById(tournamentId, false);

    if (
      [
        TournamentStatus.Draft,
        TournamentStatus.Cancelled,
        TournamentStatus.Completed,
        TournamentStatus.InProgress,
      ].includes(tournament.status)
    ) {
      return;
    }
    // Registration open/close is controlled manually (Manager actions).
    // Capacity is enforced on approve/register operations, so we don't auto-close.
  }

  private async getApprovedRegistrationsCount(
    tournamentId: TournamentId,
  ): Promise<number> {
    return this.registrations.count({
      where: {
        tournamentId,
        status: In([
          TournamentRegistrationStatus.Approved,
          TournamentRegistrationStatus.Attended,
          TournamentRegistrationStatus.NoShow,
        ]),
      },
    });
  }

  private async getPendingRegistrationsCount(
    tournamentId: TournamentId,
  ): Promise<number> {
    return this.registrations.count({
      where: {
        tournamentId,
        status: TournamentRegistrationStatus.Pending,
      },
    });
  }

  private async getTournamentEntityById(
    id: TournamentId,
    publicOnly: boolean,
  ): Promise<TournamentEntity> {
    const entity = await this.tournaments.findOne({
      where: publicOnly
        ? {
            id,
            status: In([
              TournamentStatus.Published,
              TournamentStatus.RegistrationClosed,
              TournamentStatus.InProgress,
              TournamentStatus.Completed,
              TournamentStatus.Cancelled,
            ]),
          }
        : { id },
    });

    if (!entity) {
      throw new NotFoundException(`Tournament with id '${id}' not found`);
    }

    if (
      publicOnly &&
      entity.status === TournamentStatus.Cancelled &&
      !entity.publishedAt
    ) {
      // Cancelled tournaments that were never published should not be visible publicly.
      throw new NotFoundException(`Tournament with id '${id}' not found`);
    }

    return entity;
  }

  private async getRegistrationEntityById(
    id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationEntity> {
    const entity = await this.registrations.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(
        `Tournament registration with id '${id}' not found`,
      );
    }

    return entity;
  }

  private async mapTournamentToDto(
    entity: TournamentEntity,
  ): Promise<TournamentDto> {
    return plainToInstance(
      TournamentDto,
      {
        ...entity,
        entryFee: Number(entity.entryFee),
        approvedRegistrationsCount: await this.getApprovedRegistrationsCount(
          entity.id,
        ),
        pendingRegistrationsCount: await this.getPendingRegistrationsCount(
          entity.id,
        ),
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private async mapRegistrationToDto(
    entity: TournamentRegistrationEntity,
    approvedRegistrationsCount?: number,
  ): Promise<TournamentRegistrationDto> {
    return plainToInstance(
      TournamentRegistrationDto,
      {
        ...entity,
        approvedRegistrationsCount:
          approvedRegistrationsCount ??
          (await this.getApprovedRegistrationsCount(entity.tournamentId)),
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private buildListQuery(query: GetTournamentsQueryDto, publicOnly: boolean) {
    this.validateListFilters(query);

    const queryBuilder = this.tournaments
      .createQueryBuilder('tournament')
      .orderBy('tournament.startAt', 'DESC');

    if (publicOnly) {
      queryBuilder.where('tournament.status IN (:...publicStatuses)', {
        publicStatuses: [
          TournamentStatus.Published,
          TournamentStatus.RegistrationClosed,
          TournamentStatus.InProgress,
          TournamentStatus.Completed,
          TournamentStatus.Cancelled,
        ],
      });
      queryBuilder.andWhere(
        '(tournament.status != :cancelledStatus OR tournament.publishedAt IS NOT NULL)',
        {
          cancelledStatus: TournamentStatus.Cancelled,
        },
      );
    }

    if (query.search) {
      queryBuilder.andWhere('tournament.title ILIKE :search', {
        search: `%${query.search.trim()}%`,
      });
    }

    if (query.status !== undefined) {
      queryBuilder.andWhere('tournament.status = :status', {
        status: query.status,
      });
    }

    if (query.startDateFrom) {
      queryBuilder.andWhere('tournament.startAt >= :startDateFrom', {
        startDateFrom: query.startDateFrom,
      });
    }

    if (query.startDateTo) {
      queryBuilder.andWhere('tournament.startAt <= :startDateTo', {
        startDateTo: query.startDateTo,
      });
    }

    if (query.registrationDeadlineFrom) {
      queryBuilder.andWhere(
        'tournament.registrationDeadline >= :registrationDeadlineFrom',
        {
          registrationDeadlineFrom: query.registrationDeadlineFrom,
        },
      );
    }

    if (query.registrationDeadlineTo) {
      queryBuilder.andWhere(
        'tournament.registrationDeadline <= :registrationDeadlineTo',
        {
          registrationDeadlineTo: query.registrationDeadlineTo,
        },
      );
    }

    if (query.minEntryFee !== undefined) {
      queryBuilder.andWhere('tournament.entryFee >= :minEntryFee', {
        minEntryFee: query.minEntryFee,
      });
    }

    if (query.maxEntryFee !== undefined) {
      queryBuilder.andWhere('tournament.entryFee <= :maxEntryFee', {
        maxEntryFee: query.maxEntryFee,
      });
    }

    return queryBuilder;
  }

  private validateListFilters({
    startDateFrom,
    startDateTo,
    registrationDeadlineFrom,
    registrationDeadlineTo,
    minEntryFee,
    maxEntryFee,
  }: GetTournamentsQueryDto): void {
    if (startDateFrom && startDateTo && startDateFrom > startDateTo) {
      throw new BadRequestException(
        'startDateFrom cannot be greater than startDateTo',
      );
    }

    if (
      registrationDeadlineFrom &&
      registrationDeadlineTo &&
      registrationDeadlineFrom > registrationDeadlineTo
    ) {
      throw new BadRequestException(
        'registrationDeadlineFrom cannot be greater than registrationDeadlineTo',
      );
    }

    if (
      minEntryFee !== undefined &&
      maxEntryFee !== undefined &&
      minEntryFee > maxEntryFee
    ) {
      throw new BadRequestException(
        'minEntryFee cannot be greater than maxEntryFee',
      );
    }
  }
}
