import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { TournamentsMessage } from './tournaments.messages';
import {
  TournamentRegistrationDto,
  TournamentRegistrationId,
} from '../../dtos/tournament-registration.dto';
import {
  TournamentDto,
  TournamentId,
  CreateTournamentDto,
  UpdateTournamentDto,
} from '../../dtos/tournament.dto';
import type { UserId } from '../../dtos/user.dto';
import { Service } from '../services.types';

@Injectable()
export class TournamentsClient {
  constructor(
    @Inject(Service.TOURNAMENTS) private readonly client: ClientProxy,
  ) {}

  async create(data: CreateTournamentDto): Promise<TournamentDto> {
    return firstValueFrom(
      this.client.send<TournamentDto, CreateTournamentDto>(
        TournamentsMessage.CREATE,
        data,
      ),
    );
  }

  async updateById(
    id: TournamentId,
    data: UpdateTournamentDto,
  ): Promise<TournamentDto> {
    return firstValueFrom(
      this.client.send<TournamentDto, [TournamentId, UpdateTournamentDto]>(
        TournamentsMessage.UPDATE_BY_ID,
        [id, data],
      ),
    );
  }

  async getById(id: TournamentId): Promise<TournamentDto> {
    return firstValueFrom(
      this.client.send<TournamentDto, TournamentId>(
        TournamentsMessage.GET_BY_ID,
        id,
      ),
    );
  }

  async getList(): Promise<TournamentDto[]> {
    return firstValueFrom(
      this.client.send<TournamentDto[], object>(
        TournamentsMessage.GET_LIST,
        {},
      ),
    );
  }

  async publishById(id: TournamentId): Promise<TournamentDto> {
    return firstValueFrom(
      this.client.send<TournamentDto, TournamentId>(
        TournamentsMessage.PUBLISH_BY_ID,
        id,
      ),
    );
  }

  async cancelById(id: TournamentId): Promise<TournamentDto> {
    return firstValueFrom(
      this.client.send<TournamentDto, TournamentId>(
        TournamentsMessage.CANCEL_BY_ID,
        id,
      ),
    );
  }

  async startById(id: TournamentId): Promise<TournamentDto> {
    return firstValueFrom(
      this.client.send<TournamentDto, TournamentId>(
        TournamentsMessage.START_BY_ID,
        id,
      ),
    );
  }

  async completeById(id: TournamentId): Promise<TournamentDto> {
    return firstValueFrom(
      this.client.send<TournamentDto, TournamentId>(
        TournamentsMessage.COMPLETE_BY_ID,
        id,
      ),
    );
  }

  async register(
    tournamentId: TournamentId,
    userId: UserId,
  ): Promise<TournamentRegistrationDto> {
    return firstValueFrom(
      this.client.send<TournamentRegistrationDto, [TournamentId, UserId]>(
        TournamentsMessage.REGISTER,
        [tournamentId, userId],
      ),
    );
  }

  async cancelRegistration(
    id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return firstValueFrom(
      this.client.send<TournamentRegistrationDto, TournamentRegistrationId>(
        TournamentsMessage.CANCEL_REGISTRATION,
        id,
      ),
    );
  }

  async approve(
    id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return firstValueFrom(
      this.client.send<TournamentRegistrationDto, TournamentRegistrationId>(
        TournamentsMessage.APPROVE_REGISTRATION,
        id,
      ),
    );
  }

  async reject(
    id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return firstValueFrom(
      this.client.send<TournamentRegistrationDto, TournamentRegistrationId>(
        TournamentsMessage.REJECT_REGISTRATION,
        id,
      ),
    );
  }

  async markAttended(
    id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return firstValueFrom(
      this.client.send<TournamentRegistrationDto, TournamentRegistrationId>(
        TournamentsMessage.MARK_ATTENDED,
        id,
      ),
    );
  }

  async markNoShow(
    id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return firstValueFrom(
      this.client.send<TournamentRegistrationDto, TournamentRegistrationId>(
        TournamentsMessage.MARK_NO_SHOW,
        id,
      ),
    );
  }

  async getByTournamentId(
    tournamentId: TournamentId,
  ): Promise<TournamentRegistrationDto[]> {
    return firstValueFrom(
      this.client.send<TournamentRegistrationDto[], TournamentId>(
        TournamentsMessage.GET_REGISTRATIONS_BY_TOURNAMENT_ID,
        tournamentId,
      ),
    );
  }

  async getByUserId(userId: UserId): Promise<TournamentRegistrationDto[]> {
    return firstValueFrom(
      this.client.send<TournamentRegistrationDto[], UserId>(
        TournamentsMessage.GET_REGISTRATIONS_BY_USER_ID,
        userId,
      ),
    );
  }
}
