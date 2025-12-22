import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import type { UserId } from '@app/shared/dtos/user.dto';
import { UserDto, UpdateUserDto, UserRole } from '@app/shared/dtos/user.dto';
import { IdentityClient } from '@app/shared/services/identity/identity.client';

import { RoleAccess } from '../auth/auth.decorators';
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
  @RoleAccess(UserRole.User)
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
  @RoleAccess(UserRole.User)
  @Put(UsersRoute.PROFILE)
  async updateById(
    @Param('id') id: UserId,
    @Body() data: UpdateUserDto,
  ): Promise<UserDto> {
    return this.identityClient.updateById(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile photo' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated user profile photo successfully',
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
  @RoleAccess(UserRole.User)
  @Post(UsersRoute.PHOTO)
  async updateProfileById(
    @Param('id') id: UserId,
    @UploadedFile() { filename, buffer, mimetype }: Express.Multer.File,
  ): Promise<UserDto> {
    return this.identityClient.updatePhotoById(id, {
      filename,
      buffer,
      mimeType: mimetype,
    });
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
  @RoleAccess(UserRole.User)
  @Delete(UsersRoute.PROFILE)
  async deleteById(@Param('id') id: UserId): Promise<UserDto> {
    return this.identityClient.deleteById(id);
  }
}
