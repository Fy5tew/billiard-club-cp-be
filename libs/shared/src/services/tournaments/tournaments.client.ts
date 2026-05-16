import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { TournamentsMessage } from './tournaments.messages';
import type {
  SetTournamentMatchResultDto,
  TournamentBracketDto,
  TournamentLeaderboardItemDto,
  TournamentMatchId,
  UpdateTournamentBracketSeedingDto,
} from '../../dtos/tournament-bracket.dto';
import type {
  TournamentParticipantDto,
  UpdateTournamentParticipantAttendanceDto,
} from '../../dtos/tournament-participant.dto';
import {
  CreateTournamentRegistrationManualDto,
  TournamentRegistrationDto,
  TournamentRegistrationId,
} from '../../dtos/tournament-registration.dto';
import {
  TournamentDto,
  GetTournamentsQueryDto,
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

  async getList(query: GetTournamentsQueryDto = {}): Promise<TournamentDto[]> {
    return firstValueFrom(
      this.client.send<TournamentDto[], GetTournamentsQueryDto>(
        TournamentsMessage.GET_LIST,
        query,
      ),
    );
  }

  async getByIdPrivate(id: TournamentId): Promise<TournamentDto> {
    return firstValueFrom(
      this.client.send<TournamentDto, TournamentId>(
        TournamentsMessage.GET_BY_ID_PRIVATE,
        id,
      ),
    );
  }

  async getListPrivate(
    query: GetTournamentsQueryDto = {},
  ): Promise<TournamentDto[]> {
    return firstValueFrom(
      this.client.send<TournamentDto[], GetTournamentsQueryDto>(
        TournamentsMessage.GET_LIST_PRIVATE,
        query,
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

  async closeRegistrationById(id: TournamentId): Promise<TournamentDto> {
    return firstValueFrom(
      this.client.send<TournamentDto, TournamentId>(
        TournamentsMessage.CLOSE_REGISTRATION_BY_ID,
        id,
      ),
    );
  }

  async openRegistrationById(id: TournamentId): Promise<TournamentDto> {
    return firstValueFrom(
      this.client.send<TournamentDto, TournamentId>(
        TournamentsMessage.OPEN_REGISTRATION_BY_ID,
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

  async registerManual(
    tournamentId: TournamentId,
    data: CreateTournamentRegistrationManualDto,
  ): Promise<TournamentRegistrationDto> {
    return firstValueFrom(
      this.client.send<
        TournamentRegistrationDto,
        [TournamentId, CreateTournamentRegistrationManualDto]
      >(TournamentsMessage.REGISTER_MANUAL, [tournamentId, data]),
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

  async getParticipants(
    tournamentId: TournamentId,
  ): Promise<TournamentParticipantDto[]> {
    return firstValueFrom(
      this.client.send<TournamentParticipantDto[], TournamentId>(
        TournamentsMessage.GET_PARTICIPANTS,
        tournamentId,
      ),
    );
  }

  async updateParticipantAttendance(
    tournamentId: TournamentId,
    registrationId: TournamentRegistrationId,
    data: UpdateTournamentParticipantAttendanceDto,
  ): Promise<TournamentParticipantDto> {
    return firstValueFrom(
      this.client.send<
        TournamentParticipantDto,
        [
          TournamentId,
          TournamentRegistrationId,
          UpdateTournamentParticipantAttendanceDto,
        ]
      >(TournamentsMessage.UPDATE_PARTICIPANT_ATTENDANCE, [
        tournamentId,
        registrationId,
        data,
      ]),
    );
  }

  async getBracket(
    tournamentId: TournamentId,
  ): Promise<TournamentBracketDto | null> {
    return firstValueFrom(
      this.client.send<TournamentBracketDto | null, TournamentId>(
        TournamentsMessage.GET_BRACKET,
        tournamentId,
      ),
    );
  }

  async createBracket(
    tournamentId: TournamentId,
  ): Promise<TournamentBracketDto> {
    return firstValueFrom(
      this.client.send<TournamentBracketDto, TournamentId>(
        TournamentsMessage.CREATE_BRACKET,
        tournamentId,
      ),
    );
  }

  async randomizeBracketSeeding(
    tournamentId: TournamentId,
  ): Promise<TournamentBracketDto> {
    return firstValueFrom(
      this.client.send<TournamentBracketDto, TournamentId>(
        TournamentsMessage.RANDOMIZE_BRACKET_SEEDING,
        tournamentId,
      ),
    );
  }

  async updateBracketSeeding(
    tournamentId: TournamentId,
    data: UpdateTournamentBracketSeedingDto,
  ): Promise<TournamentBracketDto> {
    return firstValueFrom(
      this.client.send<
        TournamentBracketDto,
        [TournamentId, UpdateTournamentBracketSeedingDto]
      >(TournamentsMessage.UPDATE_BRACKET_SEEDING, [tournamentId, data]),
    );
  }

  async confirmBracketSeeding(
    tournamentId: TournamentId,
  ): Promise<TournamentBracketDto> {
    return firstValueFrom(
      this.client.send<TournamentBracketDto, TournamentId>(
        TournamentsMessage.CONFIRM_BRACKET_SEEDING,
        tournamentId,
      ),
    );
  }

  async setMatchResult(
    tournamentId: TournamentId,
    matchId: TournamentMatchId,
    data: SetTournamentMatchResultDto,
  ): Promise<TournamentBracketDto> {
    return firstValueFrom(
      this.client.send<
        TournamentBracketDto,
        [TournamentId, TournamentMatchId, SetTournamentMatchResultDto]
      >(TournamentsMessage.SET_MATCH_RESULT, [tournamentId, matchId, data]),
    );
  }

  async getLeaderboard(
    tournamentId: TournamentId,
  ): Promise<TournamentLeaderboardItemDto[]> {
    return firstValueFrom(
      this.client.send<TournamentLeaderboardItemDto[], TournamentId>(
        TournamentsMessage.GET_LEADERBOARD,
        tournamentId,
      ),
    );
  }
}
