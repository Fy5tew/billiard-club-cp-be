import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { IdentityClient } from '@app/shared/clients/identity.client';
import { AccessTokenDto, LoginDto } from '@app/shared/dtos/auth.dto';
import { CreateUserDto, UserDto } from '@app/shared/dtos/user.dto';
import type { RequestWithUserId } from '@app/shared/types/auth.types';

import { JWT_REFRESH_TOKEN_COOKIE } from '../auth/auth.constants';
import { PublicRoute } from '../auth/auth.decorators';
import { JwtRefreshGuard } from '../auth/jwt-refresh.guard';
import { AuthRoute } from '../constants/auth.constants';

@Controller(AuthRoute.BASE)
export class AuthController {
  constructor(private readonly identityClient: IdentityClient) {}

  @PublicRoute()
  @Post(AuthRoute.REGISTER)
  async register(@Body() data: CreateUserDto): Promise<UserDto> {
    return this.identityClient.register(data);
  }

  @PublicRoute()
  @HttpCode(HttpStatus.OK)
  @Post(AuthRoute.LOGIN)
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenDto> {
    const { accessToken, refreshToken } = await this.identityClient.login(data);

    AuthController.setRefreshTokenCookie(response, refreshToken);

    return { accessToken };
  }

  @PublicRoute()
  @UseGuards(JwtRefreshGuard)
  @Get(AuthRoute.REFRESH)
  async refresh(
    @Req() request: RequestWithUserId,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenDto> {
    const { userId } = request.user;

    const { accessToken, refreshToken } =
      await this.identityClient.refresh(userId);

    AuthController.setRefreshTokenCookie(response, refreshToken);

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
