import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  SetTournamentMatchResultDto,
  TournamentBracketDto,
  TournamentLeaderboardItemDto,
  TournamentMatchId,
  UpdateTournamentBracketSeedingDto,
} from '@app/shared/dtos/tournament-bracket.dto';
import {
  TournamentParticipantDto,
  UpdateTournamentParticipantAttendanceDto,
} from '@app/shared/dtos/tournament-participant.dto';
import {
  CreateTournamentRegistrationManualDto,
  TournamentRegistrationDto,
} from '@app/shared/dtos/tournament-registration.dto';
import type { TournamentRegistrationId } from '@app/shared/dtos/tournament-registration.dto';
import {
  TournamentDto,
  CreateTournamentDto,
  GetTournamentsQueryDto,
  UpdateTournamentDto,
} from '@app/shared/dtos/tournament.dto';
import type { TournamentId } from '@app/shared/dtos/tournament.dto';
import type { UserId } from '@app/shared/dtos/user.dto';
import { TournamentsMessage } from '@app/shared/services/tournaments/tournaments.messages';

import { TournamentsService } from './tournaments.service';

@Controller()
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @MessagePattern(TournamentsMessage.CREATE)
  async create(@Payload() data: CreateTournamentDto): Promise<TournamentDto> {
    return this.tournamentsService.create(data);
  }

  @MessagePattern(TournamentsMessage.UPDATE_BY_ID)
  async updateById(
    @Payload() [id, data]: [TournamentId, UpdateTournamentDto],
  ): Promise<TournamentDto> {
    return this.tournamentsService.updateById(id, data);
  }

  @MessagePattern(TournamentsMessage.GET_BY_ID)
  async getById(@Payload() id: TournamentId): Promise<TournamentDto> {
    return this.tournamentsService.getById(id);
  }

  @MessagePattern(TournamentsMessage.GET_LIST)
  async getList(
    @Payload() query: GetTournamentsQueryDto,
  ): Promise<TournamentDto[]> {
    return this.tournamentsService.getList(query);
  }

  @MessagePattern(TournamentsMessage.GET_BY_ID_PRIVATE)
  async getByIdPrivate(@Payload() id: TournamentId): Promise<TournamentDto> {
    return this.tournamentsService.getByIdPrivate(id);
  }

  @MessagePattern(TournamentsMessage.GET_LIST_PRIVATE)
  async getListPrivate(
    @Payload() query: GetTournamentsQueryDto,
  ): Promise<TournamentDto[]> {
    return this.tournamentsService.getListPrivate(query);
  }

  @MessagePattern(TournamentsMessage.PUBLISH_BY_ID)
  async publishById(@Payload() id: TournamentId): Promise<TournamentDto> {
    return this.tournamentsService.publishById(id);
  }

  @MessagePattern(TournamentsMessage.CLOSE_REGISTRATION_BY_ID)
  async closeRegistrationById(
    @Payload() id: TournamentId,
  ): Promise<TournamentDto> {
    return this.tournamentsService.closeRegistrationById(id);
  }

  @MessagePattern(TournamentsMessage.OPEN_REGISTRATION_BY_ID)
  async openRegistrationById(
    @Payload() id: TournamentId,
  ): Promise<TournamentDto> {
    return this.tournamentsService.openRegistrationById(id);
  }

  @MessagePattern(TournamentsMessage.CANCEL_BY_ID)
  async cancelById(@Payload() id: TournamentId): Promise<TournamentDto> {
    return this.tournamentsService.cancelById(id);
  }

  @MessagePattern(TournamentsMessage.START_BY_ID)
  async startById(@Payload() id: TournamentId): Promise<TournamentDto> {
    return this.tournamentsService.startById(id);
  }

  @MessagePattern(TournamentsMessage.COMPLETE_BY_ID)
  async completeById(@Payload() id: TournamentId): Promise<TournamentDto> {
    return this.tournamentsService.completeById(id);
  }

  @MessagePattern(TournamentsMessage.REGISTER)
  async register(
    @Payload() [tournamentId, userId]: [TournamentId, UserId],
  ): Promise<TournamentRegistrationDto> {
    return this.tournamentsService.register(tournamentId, userId);
  }

  @MessagePattern(TournamentsMessage.REGISTER_MANUAL)
  async registerManual(
    @Payload()
    [tournamentId, data]: [TournamentId, CreateTournamentRegistrationManualDto],
  ): Promise<TournamentRegistrationDto> {
    return this.tournamentsService.registerManual(tournamentId, data);
  }

  @MessagePattern(TournamentsMessage.CANCEL_REGISTRATION)
  async cancelRegistration(
    @Payload() id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return this.tournamentsService.cancelRegistration(id);
  }

  @MessagePattern(TournamentsMessage.APPROVE_REGISTRATION)
  async approve(
    @Payload() id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return this.tournamentsService.approve(id);
  }

  @MessagePattern(TournamentsMessage.REJECT_REGISTRATION)
  async reject(
    @Payload() id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return this.tournamentsService.reject(id);
  }

  @MessagePattern(TournamentsMessage.MARK_ATTENDED)
  async markAttended(
    @Payload() id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return this.tournamentsService.markAttended(id);
  }

  @MessagePattern(TournamentsMessage.MARK_NO_SHOW)
  async markNoShow(
    @Payload() id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return this.tournamentsService.markNoShow(id);
  }

  @MessagePattern(TournamentsMessage.GET_REGISTRATIONS_BY_TOURNAMENT_ID)
  async getByTournamentId(
    @Payload() tournamentId: TournamentId,
  ): Promise<TournamentRegistrationDto[]> {
    return this.tournamentsService.getByTournamentId(tournamentId);
  }

  @MessagePattern(TournamentsMessage.GET_REGISTRATIONS_BY_USER_ID)
  async getByUserId(
    @Payload() userId: UserId,
  ): Promise<TournamentRegistrationDto[]> {
    return this.tournamentsService.getByUserId(userId);
  }

  @MessagePattern(TournamentsMessage.GET_PARTICIPANTS)
  async getParticipants(
    @Payload() tournamentId: TournamentId,
  ): Promise<TournamentParticipantDto[]> {
    return this.tournamentsService.getParticipants(tournamentId);
  }

  @MessagePattern(TournamentsMessage.UPDATE_PARTICIPANT_ATTENDANCE)
  async updateParticipantAttendance(
    @Payload()
    [tournamentId, registrationId, data]: [
      TournamentId,
      TournamentRegistrationId,
      UpdateTournamentParticipantAttendanceDto,
    ],
  ): Promise<TournamentParticipantDto> {
    return this.tournamentsService.updateParticipantAttendance(
      tournamentId,
      registrationId,
      data.status,
    );
  }

  @MessagePattern(TournamentsMessage.GET_BRACKET)
  async getBracket(
    @Payload() tournamentId: TournamentId,
  ): Promise<TournamentBracketDto | null> {
    return this.tournamentsService.getBracket(tournamentId);
  }

  @MessagePattern(TournamentsMessage.CREATE_BRACKET)
  async createBracket(
    @Payload() tournamentId: TournamentId,
  ): Promise<TournamentBracketDto> {
    return this.tournamentsService.createBracket(tournamentId);
  }

  @MessagePattern(TournamentsMessage.RANDOMIZE_BRACKET_SEEDING)
  async randomizeBracketSeeding(
    @Payload() tournamentId: TournamentId,
  ): Promise<TournamentBracketDto> {
    return this.tournamentsService.randomizeBracketSeeding(tournamentId);
  }

  @MessagePattern(TournamentsMessage.UPDATE_BRACKET_SEEDING)
  async updateBracketSeeding(
    @Payload()
    [tournamentId, data]: [TournamentId, UpdateTournamentBracketSeedingDto],
  ): Promise<TournamentBracketDto> {
    return this.tournamentsService.updateBracketSeeding(tournamentId, data);
  }

  @MessagePattern(TournamentsMessage.CONFIRM_BRACKET_SEEDING)
  async confirmBracketSeeding(
    @Payload() tournamentId: TournamentId,
  ): Promise<TournamentBracketDto> {
    return this.tournamentsService.confirmBracketSeeding(tournamentId);
  }

  @MessagePattern(TournamentsMessage.SET_MATCH_RESULT)
  async setMatchResult(
    @Payload()
    [tournamentId, matchId, data]: [
      TournamentId,
      TournamentMatchId,
      SetTournamentMatchResultDto,
    ],
  ): Promise<TournamentBracketDto> {
    return this.tournamentsService.setMatchResult(tournamentId, matchId, data);
  }

  @MessagePattern(TournamentsMessage.GET_LEADERBOARD)
  async getLeaderboard(
    @Payload() tournamentId: TournamentId,
  ): Promise<TournamentLeaderboardItemDto[]> {
    return this.tournamentsService.getLeaderboard(tournamentId);
  }
}
