import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import type { UserId } from '@app/shared/dtos/user.dto';
import {
  UserDto,
  UpdateUserDto,
  UpdateUserProfileDto,
  UserRole,
} from '@app/shared/dtos/user.dto';
import { IdentityClient } from '@app/shared/services/identity/identity.client';
import type { RequestWithUser } from '@app/shared/types/auth.types';

import { RoleAccess } from '../auth/auth.decorators';
import { UsersRoute } from '../constants/users.constants';

@Controller(UsersRoute.BASE)
export class UsersController {
  constructor(private readonly identityClient: IdentityClient) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
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
  @Get(UsersRoute.CURRENT_USER)
  async getCurrent(@Req() { user }: RequestWithUser): Promise<UserDto> {
    return this.identityClient.getById(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user info' })
  @ApiBody({ description: 'User data to update', type: UpdateUserProfileDto })
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
  @Put(UsersRoute.CURRENT_USER)
  async updateCurrent(
    @Req() { user }: RequestWithUser,
    @Body() data: UpdateUserProfileDto,
  ): Promise<UserDto> {
    return this.identityClient.updateById(user.id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile photo' })
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
  @UseInterceptors(FileInterceptor('file'))
  @Post(UsersRoute.CURRENT_USER_PHOTO)
  async updateCurrentPhoto(
    @Req() { user }: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserDto> {
    if (!file) {
      throw new BadRequestException('File not found in request');
    }

    const { filename, buffer, mimetype } = file;

    return this.identityClient.updatePhotoById(user.id, {
      filename,
      buffer,
      mimeType: mimetype,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user profile photo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deleted user profile photo successfully',
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
  @Delete(UsersRoute.CURRENT_USER_PHOTO)
  async deleteCurrentPhoto(@Req() { user }: RequestWithUser): Promise<UserDto> {
    return this.identityClient.deletePhotoById(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user' })
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
  @Delete(UsersRoute.CURRENT_USER)
  async deleteCurrent(@Req() { user }: RequestWithUser): Promise<UserDto> {
    return this.identityClient.deleteById(user.id);
  }

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
  @RoleAccess(UserRole.Manager)
  @Get(UsersRoute.USER)
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
  @RoleAccess(UserRole.Admin)
  @Put(UsersRoute.USER)
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
  @RoleAccess(UserRole.Admin)
  @UseInterceptors(FileInterceptor('file'))
  @Post(UsersRoute.USER_PHOTO)
  async updateProfilePhotoById(
    @Param('id') id: UserId,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserDto> {
    if (!file) {
      throw new BadRequestException('File not found in request');
    }

    const { filename, buffer, mimetype } = file;

    return this.identityClient.updatePhotoById(id, {
      filename,
      buffer,
      mimeType: mimetype,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user profile photo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deleted user profile photo successfully',
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
  @Delete(UsersRoute.CURRENT_USER_PHOTO)
  async deleteProfilePhotoById(@Param('id') id: UserId): Promise<UserDto> {
    return this.identityClient.deletePhotoById(id);
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
  @RoleAccess(UserRole.Admin)
  @Delete(UsersRoute.USER)
  async deleteById(@Param('id') id: UserId): Promise<UserDto> {
    return this.identityClient.deleteById(id);
  }
}
