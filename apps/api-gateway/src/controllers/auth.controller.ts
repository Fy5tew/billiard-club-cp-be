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
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { AccessTokenDto, LoginDto } from '@app/shared/dtos/auth.dto';
import { CreateUserDto, UserDto } from '@app/shared/dtos/user.dto';
import { IdentityClient } from '@app/shared/services/identity/identity.client';
import type { RequestWithUserId } from '@app/shared/types/auth.types';

import { JWT_REFRESH_TOKEN_COOKIE } from '../auth/auth.constants';
import { PublicRoute } from '../auth/auth.decorators';
import { JwtRefreshGuard } from '../auth/jwt-refresh.guard';
import {
  AuthRoute,
  JWT_REFRESH_TOKEN_COOKIE_OPTIONS,
} from '../constants/auth.constants';

@ApiTags('Auth')
@Controller(AuthRoute.BASE)
export class AuthController {
  constructor(private readonly identityClient: IdentityClient) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ description: 'New user data', type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'New user is registered successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with same email is already exists',
  })
  @PublicRoute()
  @Post(AuthRoute.REGISTER)
  async register(@Body() data: CreateUserDto): Promise<UserDto> {
    return this.identityClient.register(data);
  }

  @ApiOperation({
    summary: 'Login to the system and obtain tokens',
    description:
      'Generates access and refresh tokens for the user. Sets the refresh token in cookies and returns the access token to the user',
  })
  @ApiBody({ description: 'User login credentials', type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
    type: AccessTokenDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
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

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Generate new tokens pair',
    description:
      'Generates access and refresh tokens for the user. Sets the refresh token in cookies and returns the access token to the user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens pair generated successfully',
    type: AccessTokenDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The refresh token is invalid or expired',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User with ID from refresh token was not found',
  })
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

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Logout from the system',
    description: 'Deletes the refresh token from cookies',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged out successfully',
    type: AccessTokenDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The refresh token is invalid or expired',
  })
  @PublicRoute()
  @UseGuards(JwtRefreshGuard)
  @Get(AuthRoute.LOGOUT)
  logout(@Res({ passthrough: true }) response: Response): void {
    AuthController.removeRefreshTokenCookie(response);
  }

  private static setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
  ): void {
    response.cookie(
      JWT_REFRESH_TOKEN_COOKIE,
      refreshToken,
      JWT_REFRESH_TOKEN_COOKIE_OPTIONS,
    );
  }

  private static removeRefreshTokenCookie(response: Response): void {
    response.clearCookie(
      JWT_REFRESH_TOKEN_COOKIE,
      JWT_REFRESH_TOKEN_COOKIE_OPTIONS,
    );
  }
}
