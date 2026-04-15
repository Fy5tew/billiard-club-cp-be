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
  UpdateTournamentDto,
} from '@app/shared/dtos/tournament.dto';
import type { UserId } from '@app/shared/dtos/user.dto';
import { TournamentRegistrationEntity } from '@app/shared/entities/tournament-registration.entity';
import { TournamentEntity } from '@app/shared/entities/tournament.entity';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(TournamentEntity)
    private readonly tournaments: Repository<TournamentEntity>,
    @InjectRepository(TournamentRegistrationEntity)
    private readonly registrations: Repository<TournamentRegistrationEntity>,
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

  async getList(): Promise<TournamentDto[]> {
    const entities = await this.tournaments.find({
      where: {
        status: In([
          TournamentStatus.Published,
          TournamentStatus.RegistrationClosed,
          TournamentStatus.InProgress,
          TournamentStatus.Completed,
          TournamentStatus.Cancelled,
        ]),
      },
      order: {
        startAt: 'ASC',
      },
    });

    return entities.map((entity) => this.mapTournamentToDto(entity));
  }

  async getByIdPrivate(id: TournamentId): Promise<TournamentDto> {
    return this.mapTournamentToDto(
      await this.getTournamentEntityById(id, false),
    );
  }

  async getListPrivate(): Promise<TournamentDto[]> {
    const entities = await this.tournaments.find({
      order: {
        startAt: 'ASC',
      },
    });

    return entities.map((entity) => this.mapTournamentToDto(entity));
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

    tournament.status = TournamentStatus.Completed;
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
        status: In([
          TournamentRegistrationStatus.Pending,
          TournamentRegistrationStatus.Approved,
        ]),
      },
    });

    if (existingRegistration) {
      throw new ConflictException('User already has an active registration');
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

    if (tournament.status !== TournamentStatus.Published) {
      throw new BadRequestException('Tournament registration is closed');
    }

    this.ensureRegistrationIsOpen(tournament);

    const activeRegistration = await this.registrations.findOne({
      where: {
        tournamentId,
        userId,
        status: In([
          TournamentRegistrationStatus.Pending,
          TournamentRegistrationStatus.Approved,
        ]),
      },
    });

    if (activeRegistration?.status === TournamentRegistrationStatus.Approved) {
      throw new ConflictException('User already has an approved registration');
    }

    const approvedCount =
      await this.getApprovedRegistrationsCount(tournamentId);
    if (approvedCount >= tournament.maxParticipants) {
      throw new ConflictException('Tournament participant limit reached');
    }

    const registration =
      activeRegistration ??
      this.registrations.create({
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

  private async finalizeAttendance(
    id: TournamentRegistrationId,
    nextStatus:
      | TournamentRegistrationStatus.Attended
      | TournamentRegistrationStatus.NoShow,
  ): Promise<TournamentRegistrationDto> {
    const registration = await this.getRegistrationEntityById(id);
    const tournament = await this.getTournamentEntityById(
      registration.tournamentId,
      false,
    );

    if (!this.hasTournamentStarted(tournament)) {
      throw new BadRequestException(
        'Attendance can only be marked after tournament start',
      );
    }

    this.ensureRegistrationTransition(registration.status, nextStatus);

    registration.status = nextStatus;
    await this.registrations.save(registration);

    return this.mapRegistrationToDto(registration);
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
      [TournamentRegistrationStatus.Rejected]: [],
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

    const approvedCount =
      await this.getApprovedRegistrationsCount(tournamentId);

    if (approvedCount >= tournament.maxParticipants) {
      if (tournament.status !== TournamentStatus.RegistrationClosed) {
        tournament.status = TournamentStatus.RegistrationClosed;
        await this.tournaments.save(tournament);
      }
      return;
    }

    if (
      tournament.status === TournamentStatus.RegistrationClosed &&
      new Date() < new Date(tournament.registrationDeadline) &&
      new Date() < new Date(tournament.startAt)
    ) {
      tournament.status = TournamentStatus.Published;
      await this.tournaments.save(tournament);
    }
  }

  private async getApprovedRegistrationsCount(
    tournamentId: TournamentId,
  ): Promise<number> {
    return this.registrations.count({
      where: {
        tournamentId,
        status: TournamentRegistrationStatus.Approved,
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

  private mapTournamentToDto(entity: TournamentEntity): TournamentDto {
    return plainToInstance(
      TournamentDto,
      {
        ...entity,
        entryFee: Number(entity.entryFee),
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
}
