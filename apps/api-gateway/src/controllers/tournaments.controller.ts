import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
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

import {
  SetTournamentMatchResultDto,
  TournamentBracketDto,
  TournamentLeaderboardItemDto,
  UpdateTournamentBracketSeedingDto,
} from '@app/shared/dtos/tournament-bracket.dto';
import type { TournamentMatchId } from '@app/shared/dtos/tournament-bracket.dto';
import {
  TournamentParticipantDto,
  UpdateTournamentParticipantAttendanceDto,
} from '@app/shared/dtos/tournament-participant.dto';
import {
  CreateTournamentRegistrationManualDto,
  TournamentRegistrationDto,
  TournamentRegistrationFullDto,
} from '@app/shared/dtos/tournament-registration.dto';
import type { TournamentRegistrationId } from '@app/shared/dtos/tournament-registration.dto';
import {
  TournamentDto,
  CreateTournamentDto,
  GetTournamentsQueryDto,
  UpdateTournamentDto,
} from '@app/shared/dtos/tournament.dto';
import type { TournamentId } from '@app/shared/dtos/tournament.dto';
import {
  SimplifiedUserDto,
  UserDto,
  UserRole,
} from '@app/shared/dtos/user.dto';
import { IdentityClient } from '@app/shared/services/identity/identity.client';
import { TournamentsClient } from '@app/shared/services/tournaments/tournaments.client';
import type { RequestWithUser } from '@app/shared/types/auth.types';

import { PublicRoute, RoleAccess } from '../auth/auth.decorators';
import { TournamentsRoute } from '../constants/tournaments.constants';

@ApiTags('Tournaments')
@Controller(TournamentsRoute.BASE)
export class TournamentsController {
  constructor(
    private readonly identityClient: IdentityClient,
    private readonly tournamentsClient: TournamentsClient,
  ) {}

  @ApiOperation({ summary: 'Get tournaments list' })
  @ApiResponse({ status: HttpStatus.OK, type: [TournamentDto] })
  @PublicRoute()
  @Get(TournamentsRoute.PUBLIC)
  async getPublicList(
    @Query() query: GetTournamentsQueryDto,
  ): Promise<TournamentDto[]> {
    return this.tournamentsClient.getList(query);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tournaments list including drafts' })
  @ApiResponse({ status: HttpStatus.OK, type: [TournamentDto] })
  @RoleAccess(UserRole.Manager)
  @Get()
  async getList(
    @Query() query: GetTournamentsQueryDto,
  ): Promise<TournamentDto[]> {
    return this.tournamentsClient.getListPrivate(query);
  }

  @ApiOperation({ summary: 'Get tournament by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentDto })
  @PublicRoute()
  @Get(TournamentsRoute.PUBLIC_TOURNAMENT)
  async getPublicById(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentDto> {
    return this.tournamentsClient.getById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tournament by ID including drafts' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentDto })
  @RoleAccess(UserRole.Manager)
  @Get(TournamentsRoute.TOURNAMENT)
  async getById(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentDto> {
    return this.tournamentsClient.getByIdPrivate(id);
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
  @ApiOperation({ summary: 'Close tournament registration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.TOURNAMENT_CLOSE_REGISTRATION)
  async closeRegistrationById(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentDto> {
    return this.tournamentsClient.closeRegistrationById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Open tournament registration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.TOURNAMENT_OPEN_REGISTRATION)
  async openRegistrationById(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentDto> {
    return this.tournamentsClient.openRegistrationById(id);
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
  ): Promise<TournamentRegistrationFullDto> {
    const registration = await this.tournamentsClient.register(id, user.id);
    return this.mapRegistrationToFull(registration);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register user for tournament manually' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: CreateTournamentRegistrationManualDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TournamentRegistrationFullDto,
  })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.TOURNAMENT_REGISTER_MANUAL)
  async registerManual(
    @Param('id', ParseUUIDPipe) id: TournamentId,
    @Body() data: CreateTournamentRegistrationManualDto,
  ): Promise<TournamentRegistrationFullDto> {
    await this.identityClient.getById(data.userId);

    const registration = await this.tournamentsClient.registerManual(id, data);
    return this.mapRegistrationToFull(registration);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel own tournament registration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentRegistrationFullDto })
  @RoleAccess(UserRole.User)
  @Post(TournamentsRoute.REGISTRATION_CANCEL)
  async cancelRegistration(
    @Param('id', ParseUUIDPipe) id: TournamentRegistrationId,
    @Req() { user }: RequestWithUser,
  ): Promise<TournamentRegistrationFullDto> {
    const registrations = await this.tournamentsClient.getByUserId(user.id);
    const registration = registrations.find((item) => item.id === id);

    if (!registration) {
      throw new ForbiddenException(
        'You do not have permission to modify this registration',
      );
    }

    return this.mapRegistrationToFull(
      await this.tournamentsClient.cancelRegistration(id),
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user tournament registrations' })
  @ApiResponse({ status: HttpStatus.OK, type: [TournamentRegistrationFullDto] })
  @RoleAccess(UserRole.User)
  @Get(TournamentsRoute.MY_REGISTRATIONS)
  async getMyRegistrations(
    @Req() { user }: RequestWithUser,
  ): Promise<TournamentRegistrationFullDto[]> {
    return this.mapRegistrationsToFull(
      await this.tournamentsClient.getByUserId(user.id),
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tournament registrations' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: [TournamentRegistrationFullDto] })
  @RoleAccess(UserRole.Manager)
  @Get(TournamentsRoute.TOURNAMENT_REGISTRATIONS)
  async getByTournamentId(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentRegistrationFullDto[]> {
    return this.mapRegistrationsToFull(
      await this.tournamentsClient.getByTournamentId(id),
    );
  }

  @ApiOperation({ summary: 'Get tournament participants' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: [TournamentParticipantDto] })
  @PublicRoute()
  @Get(TournamentsRoute.TOURNAMENT_PARTICIPANTS)
  async getParticipants(
    @Param('id', ParseUUIDPipe) id: TournamentId,
    @Req() request: RequestWithUser,
  ): Promise<TournamentParticipantDto[]> {
    return this.enrichParticipants(
      await this.tournamentsClient.getParticipants(id),
      request,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tournament participant attendance' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'registrationId', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateTournamentParticipantAttendanceDto })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentParticipantDto })
  @RoleAccess(UserRole.Manager)
  @Patch(TournamentsRoute.TOURNAMENT_PARTICIPANT_ATTENDANCE)
  async updateParticipantAttendance(
    @Param('id', ParseUUIDPipe) id: TournamentId,
    @Param('registrationId', ParseUUIDPipe)
    registrationId: TournamentRegistrationId,
    @Body() data: UpdateTournamentParticipantAttendanceDto,
  ): Promise<TournamentParticipantDto> {
    const participant =
      await this.tournamentsClient.updateParticipantAttendance(
        id,
        registrationId,
        data,
      );

    return this.enrichParticipant(participant, true);
  }

  @ApiOperation({ summary: 'Get tournament bracket' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentBracketDto })
  @PublicRoute()
  @Get(TournamentsRoute.TOURNAMENT_BRACKET)
  async getBracket(
    @Param('id', ParseUUIDPipe) id: TournamentId,
    @Req() request: RequestWithUser,
  ): Promise<TournamentBracketDto | null> {
    return this.enrichBracket(
      await this.tournamentsClient.getBracket(id),
      request,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create tournament bracket' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.CREATED, type: TournamentBracketDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.TOURNAMENT_BRACKET)
  async createBracket(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentBracketDto> {
    return this.enrichBracketRequired(
      await this.tournamentsClient.createBracket(id),
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Randomize tournament bracket seeding' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentBracketDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.TOURNAMENT_BRACKET_RANDOMIZE)
  async randomizeBracketSeeding(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentBracketDto> {
    return this.enrichBracketRequired(
      await this.tournamentsClient.randomizeBracketSeeding(id),
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tournament bracket seeding' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateTournamentBracketSeedingDto })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentBracketDto })
  @RoleAccess(UserRole.Manager)
  @Patch(TournamentsRoute.TOURNAMENT_BRACKET_SEEDING)
  async updateBracketSeeding(
    @Param('id', ParseUUIDPipe) id: TournamentId,
    @Body() data: UpdateTournamentBracketSeedingDto,
  ): Promise<TournamentBracketDto> {
    return this.enrichBracketRequired(
      await this.tournamentsClient.updateBracketSeeding(id, data),
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm tournament bracket seeding' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentBracketDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.TOURNAMENT_BRACKET_CONFIRM)
  async confirmBracketSeeding(
    @Param('id', ParseUUIDPipe) id: TournamentId,
  ): Promise<TournamentBracketDto> {
    return this.enrichBracketRequired(
      await this.tournamentsClient.confirmBracketSeeding(id),
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set tournament match result' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  @ApiBody({ type: SetTournamentMatchResultDto })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentBracketDto })
  @RoleAccess(UserRole.Manager)
  @Patch(TournamentsRoute.TOURNAMENT_MATCH_RESULT)
  async setMatchResult(
    @Param('id', ParseUUIDPipe) id: TournamentId,
    @Param('matchId', ParseUUIDPipe) matchId: TournamentMatchId,
    @Body() data: SetTournamentMatchResultDto,
  ): Promise<TournamentBracketDto> {
    return this.enrichBracketRequired(
      await this.tournamentsClient.setMatchResult(id, matchId, data),
    );
  }

  @ApiOperation({ summary: 'Get tournament leaderboard' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: [TournamentLeaderboardItemDto] })
  @PublicRoute()
  @Get(TournamentsRoute.TOURNAMENT_LEADERBOARD)
  async getLeaderboard(
    @Param('id', ParseUUIDPipe) id: TournamentId,
    @Req() request: RequestWithUser,
  ): Promise<TournamentLeaderboardItemDto[]> {
    return this.enrichLeaderboard(
      await this.tournamentsClient.getLeaderboard(id),
      request,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve tournament registration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentRegistrationFullDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.REGISTRATION_APPROVE)
  async approve(
    @Param('id', ParseUUIDPipe) id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationFullDto> {
    return this.mapRegistrationToFull(await this.tournamentsClient.approve(id));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject tournament registration' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentRegistrationFullDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.REGISTRATION_REJECT)
  async reject(
    @Param('id', ParseUUIDPipe) id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationFullDto> {
    return this.mapRegistrationToFull(await this.tournamentsClient.reject(id));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark participant as attended' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentRegistrationFullDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.REGISTRATION_ATTENDED)
  async markAttended(
    @Param('id', ParseUUIDPipe) id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationFullDto> {
    return this.mapRegistrationToFull(
      await this.tournamentsClient.markAttended(id),
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark participant as no-show' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, type: TournamentRegistrationFullDto })
  @RoleAccess(UserRole.Manager)
  @Post(TournamentsRoute.REGISTRATION_NO_SHOW)
  async markNoShow(
    @Param('id', ParseUUIDPipe) id: TournamentRegistrationId,
  ): Promise<TournamentRegistrationFullDto> {
    return this.mapRegistrationToFull(
      await this.tournamentsClient.markNoShow(id),
    );
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

  private async enrichParticipants(
    participants: TournamentParticipantDto[],
    request?: RequestWithUser,
  ): Promise<TournamentParticipantDto[]> {
    const includePrivateUserData = this.canViewPrivateTournamentUsers(request);
    const currentUserId = request?.user?.id;

    return Promise.all(
      participants.map((participant) =>
        this.enrichParticipant(
          participant,
          includePrivateUserData,
          currentUserId,
        ),
      ),
    );
  }

  private async enrichParticipant(
    participant: TournamentParticipantDto,
    includePrivateUserData = false,
    currentUserId?: string,
  ): Promise<TournamentParticipantDto> {
    const user = await this.fetchSafe(() =>
      this.identityClient.getById(participant.userId),
    );

    return {
      ...participant,
      userId:
        includePrivateUserData || currentUserId === participant.userId
          ? participant.userId
          : (null as never),
      user: this.toTournamentUser(user, includePrivateUserData),
    };
  }

  private async enrichBracket(
    bracket: TournamentBracketDto | null,
    request?: RequestWithUser,
  ): Promise<TournamentBracketDto | null> {
    if (!bracket) {
      return null;
    }

    return this.enrichBracketRequired(
      bracket,
      this.canViewPrivateTournamentUsers(request),
      request?.user?.id,
    );
  }

  private async enrichBracketRequired(
    bracket: TournamentBracketDto,
    includePrivateUserData = true,
    currentUserId?: string,
  ): Promise<TournamentBracketDto> {
    const userIds = new Set<string>();

    bracket.rounds.forEach((round) => {
      round.matches.forEach((match) => {
        if (match.participantAUserId) {
          userIds.add(match.participantAUserId);
        }

        if (match.participantBUserId) {
          userIds.add(match.participantBUserId);
        }
      });
    });

    const users = await this.getSimplifiedUsersByIds([...userIds]);

    return {
      ...bracket,
      rounds: bracket.rounds.map((round) => ({
        ...round,
        matches: round.matches.map((match) => ({
          ...match,
          participantAUserId:
            includePrivateUserData || currentUserId === match.participantAUserId
              ? match.participantAUserId
              : null,
          participantBUserId:
            includePrivateUserData || currentUserId === match.participantBUserId
              ? match.participantBUserId
              : null,
          winnerUserId:
            includePrivateUserData || currentUserId === match.winnerUserId
              ? match.winnerUserId
              : null,
          loserUserId:
            includePrivateUserData || currentUserId === match.loserUserId
              ? match.loserUserId
              : null,
          winnerSlot: !match.winnerUserId
            ? null
            : match.winnerUserId === match.participantAUserId
              ? 'A'
              : match.winnerUserId === match.participantBUserId
                ? 'B'
                : null,
          participantA: match.participantAUserId
            ? this.toTournamentUser(
                users.get(match.participantAUserId) ?? null,
                includePrivateUserData,
              )
            : null,
          participantB: match.participantBUserId
            ? this.toTournamentUser(
                users.get(match.participantBUserId) ?? null,
                includePrivateUserData,
              )
            : null,
        })),
      })),
    };
  }

  private async enrichLeaderboard(
    leaderboard: TournamentLeaderboardItemDto[],
    request?: RequestWithUser,
  ): Promise<TournamentLeaderboardItemDto[]> {
    const includePrivateUserData = this.canViewPrivateTournamentUsers(request);
    const currentUserId = request?.user?.id;
    const users = await this.getSimplifiedUsersByIds(
      leaderboard.map(({ userId }) => userId),
    );

    return leaderboard.map((item) => ({
      ...item,
      userId:
        includePrivateUserData || currentUserId === item.userId
          ? item.userId
          : (null as never),
      user: this.toTournamentUser(
        users.get(item.userId) ?? null,
        includePrivateUserData,
      ),
    }));
  }

  private async getSimplifiedUsersByIds(
    userIds: string[],
  ): Promise<Map<string, SimplifiedUserDto | null>> {
    const uniqueUserIds = [...new Set(userIds)];
    const users = await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const user = await this.fetchSafe(() =>
          this.identityClient.getById(userId),
        );

        return [userId, this.toSimplifiedUser(user)] as const;
      }),
    );

    return new Map(users);
  }

  private toSimplifiedUser(user: UserDto | null): SimplifiedUserDto | null {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      photoUrl: user.photoUrl,
    };
  }

  private toTournamentUser(
    user: UserDto | SimplifiedUserDto | null,
    includePrivateUserData: boolean,
  ): SimplifiedUserDto | null {
    if (!user) {
      return null;
    }

    if (includePrivateUserData) {
      return this.toSimplifiedUser(user as UserDto);
    }

    return {
      name: user.name,
      surname: user.surname,
      photoUrl: user.photoUrl ?? null,
    } as SimplifiedUserDto;
  }

  private canViewPrivateTournamentUsers(request?: RequestWithUser): boolean {
    return (request?.user?.role ?? -1) >= UserRole.Manager;
  }

  private async mapRegistrationsToFull(
    registrations: TournamentRegistrationDto[],
  ): Promise<TournamentRegistrationFullDto[]> {
    return Promise.all(
      registrations.map((registration) =>
        this.mapRegistrationToFull(registration),
      ),
    );
  }

  private async mapRegistrationToFull(
    registration: TournamentRegistrationDto,
  ): Promise<TournamentRegistrationFullDto> {
    const [user, tournament] = await Promise.all([
      this.fetchSafe(() => this.identityClient.getById(registration.userId)),
      this.fetchSafe(() =>
        this.tournamentsClient.getById(registration.tournamentId),
      ),
    ]);

    return {
      ...registration,
      user,
      tournament,
    };
  }

  private async fetchSafe<T>(request: () => Promise<T>): Promise<T | null> {
    try {
      return await request();
    } catch {
      return null;
    }
  }
}
