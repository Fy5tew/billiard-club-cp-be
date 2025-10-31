import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { IdentityClient } from '@app/shared/clients/identity.client';
import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
} from '@app/shared/dtos/user.dto';
import type { UserId } from '@app/shared/types/user.types';

import { Route } from './api-gateway.constants';

@Controller()
export class ApiGatewayController {
  constructor(private readonly identityClient: IdentityClient) {}

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
}
