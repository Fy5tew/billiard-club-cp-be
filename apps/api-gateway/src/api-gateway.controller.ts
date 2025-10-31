import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { IdentityClient } from '@app/shared/clients/identity.client';
import { AccessTokenDto, LoginDto } from '@app/shared/dtos/auth.dto';
import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
} from '@app/shared/dtos/user.dto';
import type { RequestWithUserId } from '@app/shared/types/auth.types';
import type { UserId } from '@app/shared/types/user.types';

import { Route } from './api-gateway.constants';
import { JWT_REFRESH_TOKEN_COOKIE } from './auth/auth.constants';
import { PublicRoute } from './auth/auth.decorators';
import { JwtAccessAuthGuard } from './auth/jwt-access.guard';
import { JwtRefreshGuard } from './auth/jwt-refresh.guard';

@UseGuards(JwtAccessAuthGuard)
@Controller()
export class ApiGatewayController {
  constructor(private readonly identityClient: IdentityClient) {}

  @PublicRoute()
  @Post(Route.REGISTER)
  async register(@Body() data: CreateUserDto): Promise<UserDto> {
    return this.identityClient.register(data);
  }

  @Put(Route.PROFILE)
  async update(
    @Param('id') id: UserId,
    @Body() data: UpdateUserDto,
  ): Promise<UserDto> {
    return this.identityClient.update(id, data);
  }

  @Get(Route.PROFILE)
  async getById(@Param('id') id: UserId): Promise<UserDto> {
    return this.identityClient.getById(id);
  }

  @Delete(Route.PROFILE)
  async deleteById(@Param('id') id: UserId): Promise<UserDto> {
    return this.identityClient.deleteById(id);
  }

  @PublicRoute()
  @Post(Route.LOGIN)
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenDto> {
    const { accessToken, refreshToken } = await this.identityClient.login(data);

    ApiGatewayController.setRefreshTokenCookie(response, refreshToken);

    return { accessToken };
  }

  @PublicRoute()
  @UseGuards(JwtRefreshGuard)
  @Get(Route.REFRESH)
  async refresh(
    @Req() request: RequestWithUserId,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenDto> {
    const { userId } = request.user;

    const { accessToken, refreshToken } =
      await this.identityClient.refresh(userId);

    ApiGatewayController.setRefreshTokenCookie(response, refreshToken);

    return { accessToken };
  }

  private static setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
  ): void {
    response.cookie(JWT_REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
  }
}
