import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import {
  CreateUserDto,
  IdentityClient,
  UpdateUserDto,
  UserDto,
} from '@app/shared';

import { Route } from '../constants';

@Controller()
export class ApiGatewayController {
  constructor(private readonly identityClient: IdentityClient) {}

  @Post(Route.USERS)
  async register(@Body() data: CreateUserDto): Promise<UserDto> {
    return this.identityClient.register(data);
  }

  @Put(Route.USERS)
  async update(@Body() data: UpdateUserDto): Promise<UserDto> {
    return this.identityClient.update(data);
  }

  @Get(Route.PROFILE)
  async getById(@Param('id') id: UserDto['id']): Promise<UserDto> {
    return this.identityClient.getById(id);
  }

  @Delete(Route.PROFILE)
  async deleteById(@Param('id') id: UserDto['id']): Promise<UserDto> {
    return this.identityClient.deleteById(id);
  }
}
