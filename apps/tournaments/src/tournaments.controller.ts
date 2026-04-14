import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { TournamentRegistrationDto } from '@app/shared/dtos/tournament-registration.dto';
import type { TournamentRegistrationId } from '@app/shared/dtos/tournament-registration.dto';
import {
  TournamentDto,
  CreateTournamentDto,
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
  async getList(): Promise<TournamentDto[]> {
    return this.tournamentsService.getList();
  }

  @MessagePattern(TournamentsMessage.GET_BY_ID_PRIVATE)
  async getByIdPrivate(@Payload() id: TournamentId): Promise<TournamentDto> {
    return this.tournamentsService.getByIdPrivate(id);
  }

  @MessagePattern(TournamentsMessage.GET_LIST_PRIVATE)
  async getListPrivate(): Promise<TournamentDto[]> {
    return this.tournamentsService.getListPrivate();
  }

  @MessagePattern(TournamentsMessage.PUBLISH_BY_ID)
  async publishById(@Payload() id: TournamentId): Promise<TournamentDto> {
    return this.tournamentsService.publishById(id);
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
}
