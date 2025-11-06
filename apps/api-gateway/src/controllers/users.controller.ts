import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import { IdentityClient } from '@app/shared/clients/identity.client';
import type { UserId } from '@app/shared/dtos/user.dto';
import { UserDto, UpdateUserDto } from '@app/shared/dtos/user.dto';

import { UsersRoute } from '../constants/users.constants';

@Controller(UsersRoute.BASE)
export class UsersController {
  constructor(private readonly identityClient: IdentityClient) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user info' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user info successfuly',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token not provided or expired',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User was not found',
  })
  @Get(UsersRoute.PROFILE)
  async getById(@Param('id') id: UserId): Promise<UserDto> {
    return this.identityClient.getById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user info' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ description: 'User data to update', type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated user info successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token not provided or expired',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User was not found',
  })
  @Put(UsersRoute.PROFILE)
  async update(
    @Param('id') id: UserId,
    @Body() data: UpdateUserDto,
  ): Promise<UserDto> {
    return this.identityClient.update(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deleted user successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Access token not provided or expired',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User was not found',
  })
  @Delete(UsersRoute.PROFILE)
  async deleteById(@Param('id') id: UserId): Promise<UserDto> {
    return this.identityClient.deleteById(id);
  }
}
