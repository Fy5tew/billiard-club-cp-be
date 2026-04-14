import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TournamentRegistrationDto } from '@app/shared/dtos/tournament-registration.dto';
import type { TournamentRegistrationId } from '@app/shared/dtos/tournament-registration.dto';
import {
  TournamentDto,
  CreateTournamentDto,
  UpdateTournamentDto,
} from '@app/shared/dtos/tournament.dto';
import type { TournamentId } from '@app/shared/dtos/tournament.dto';
import { UserRole } from '@app/shared/dtos/user.dto';
import { TournamentsClient } from '@app/shared/services/tournaments/tournaments.client';
import type { RequestWithUser } from '@app/shared/types/auth.types';

import { PublicRoute, RoleAccess } from '../auth/auth.decorators';
import { TournamentsRoute } from '../constants/tournaments.constants';

@ApiTags('Tournaments')
@Controller(TournamentsRoute.BASE)
export class TournamentsController {
  constructor(private readonly tournamentsClient: TournamentsClient) {}

  @ApiOperation({ summary: 'Get tournaments list' })
  @ApiResponse({ status: HttpStatus.OK, type: [TournamentDto] })
  @PublicRoute()
  @Get()
  async getList(): Promise<TournamentDto[]> {
    return this.tournamentsClient.getList();
  }

  @ApiOperation({ summary: 'Get tournament by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentDto })
  @PublicRoute()
  @Get(TournamentsRoute.TOURNAMENT)
  async getById(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentDto> {
    return this.tournamentsClient.getById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create tournament' })
  @ApiBody({ type: CreateTournamentDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: TournamentDto })
  @RoleAccess(UserRole.Admin)
  @Post()
  async create(@Body() data: CreateTournamentDto): Promise<TournamentDto> {
    return this.tournamentsClient.create(data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tournament by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateTournamentDto })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentDto })
  @RoleAccess(UserRole.Admin)
  @Put(TournamentsRoute.TOURNAMENT)
  async updateById(
    @Param('id', ParseUUIDPipe) id: TournamentId,
    @Body() data: UpdateTournamentDto,
  ): Promise<TournamentDto> {
    return this.tournamentsClient.updateById(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish tournament' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentDto })
  @RoleAccess(UserRole.Admin)
  @Post(TournamentsRoute.TOURNAMENT_PUBLISH)
  async publishById(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentDto> {
    return this.tournamentsClient.publishById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel tournament' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentDto })
  @RoleAccess(UserRole.Admin)
  @Post(TournamentsRoute.TOURNAMENT_CANCEL)
  async cancelById(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentDto> {
    return this.tournamentsClient.cancelById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register current user for tournament' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.CREATED, type: TournamentRegistrationDto })
  @RoleAccess(UserRole.User)
  @Post(TournamentsRoute.TOURNAMENT_REGISTER)
  async register(
    @Param('id', ParseUUIDPipe) id: TournamentId,
    @Req() { user }: RequestWithUser,
  ): Promise<TournamentRegistrationDto> {
    return this.tournamentsClient.register(id, user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel own tournament registration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentRegistrationDto })
  @RoleAccess(UserRole.User)
  @Post(TournamentsRoute.REGISTRATION_CANCEL)
  async cancelRegistration(
    @Param('id', ParseUUIDPipe) id: TournamentRegistrationId,
    @Req() { user }: RequestWithUser,
  ): Promise<TournamentRegistrationDto> {
    const registrations = await this.tournamentsClient.getByUserId(user.id);
    const registration = registrations.find((item) => item.id === id);

    if (!registration) {
      throw new ForbiddenException(
        'You do not have permission to modify this registration',
      );
    }

    return this.tournamentsClient.cancelRegistration(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user tournament registrations' })
  @ApiResponse({ status: HttpStatus.OK, type: [TournamentRegistrationDto] })
  @RoleAccess(UserRole.User)
  @Get(TournamentsRoute.MY_REGISTRATIONS)
  async getMyRegistrations(
    @Req() { user }: RequestWithUser,
  ): Promise<TournamentRegistrationDto[]> {
    return this.tournamentsClient.getByUserId(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tournament registrations' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: [TournamentRegistrationDto] })
  @RoleAccess(UserRole.Manager)
  @Get(TournamentsRoute.TOURNAMENT_REGISTRATIONS)
  async getByTournamentId(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentRegistrationDto[]> {
    return this.tournamentsClient.getByTournamentId(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve tournament registration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentRegistrationDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.REGISTRATION_APPROVE)
  async approve(
    @Param('id', ParseUUIDPipe) id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return this.tournamentsClient.approve(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject tournament registration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentRegistrationDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.REGISTRATION_REJECT)
  async reject(
    @Param('id', ParseUUIDPipe) id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return this.tournamentsClient.reject(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark participant as attended' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentRegistrationDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.REGISTRATION_ATTENDED)
  async markAttended(
    @Param('id', ParseUUIDPipe) id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return this.tournamentsClient.markAttended(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark participant as no-show' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentRegistrationDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.REGISTRATION_NO_SHOW)
  async markNoShow(
    @Param('id', ParseUUIDPipe) id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationDto> {
    return this.tournamentsClient.markNoShow(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start tournament' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.TOURNAMENT_START)
  async startById(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentDto> {
    return this.tournamentsClient.startById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete tournament' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.TOURNAMENT_COMPLETE)
  async completeById(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentDto> {
    return this.tournamentsClient.completeById(id);
  }
}
