import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';

import { IdentityClient } from '@app/shared/clients/identity.client';
import { UpdateUserDto, UserDto } from '@app/shared/dtos/user.dto';
import type { UserId } from '@app/shared/types/user.types';

import { UsersRoute } from '../constants/users.constants';

@Controller(UsersRoute.BASE)
export class UsersController {
  constructor(private readonly identityClient: IdentityClient) {}

  @Get(UsersRoute.PROFILE)
  async getById(@Param('id') id: UserId): Promise<UserDto> {
    return this.identityClient.getById(id);
  }

  @Put(UsersRoute.PROFILE)
  async update(
    @Param('id') id: UserId,
    @Body() data: UpdateUserDto,
  ): Promise<UserDto> {
    return this.identityClient.update(id, data);
  }

  @Delete(UsersRoute.PROFILE)
  async deleteById(@Param('id') id: UserId): Promise<UserDto> {
    return this.identityClient.deleteById(id);
  }
}
