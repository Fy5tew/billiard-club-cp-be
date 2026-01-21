import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { LoginDto, TokensDto } from '@app/shared/dtos/auth.dto';
import type {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserPhotoDto,
  UserDto,
  UserId,
} from '@app/shared/dtos/user.dto';
import { IdentityMessage } from '@app/shared/services/identity/identity.messages';

import { IdentityService } from './identity.service';

@Controller()
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @MessagePattern(IdentityMessage.REGISTER)
  async register(@Payload() data: CreateUserDto): Promise<UserDto> {
    return this.identity.create(data);
  }

  @MessagePattern(IdentityMessage.UPDATE_BY_ID)
  async updateById(
    @Payload() [id, data]: [UserId, UpdateUserDto],
  ): Promise<UserDto> {
    return this.identity.updateById(id, data);
  }

  @MessagePattern(IdentityMessage.UPDATE_PHOTO_BY_ID)
  async updatePhotoById(
    @Payload() [id, data]: [UserId, UpdateUserPhotoDto],
  ): Promise<UserDto> {
    return this.identity.updatePhotoById(id, data);
  }

  @MessagePattern(IdentityMessage.DELETE_PHOTO_BY_ID)
  async deletePhotoById(@Payload() id: UserId): Promise<UserDto> {
    return this.identity.deletePhotoById(id);
  }

  @MessagePattern(IdentityMessage.GET_BY_ID)
  async getById(@Payload() id: UserId): Promise<UserDto> {
    return this.identity.getById(id);
  }

  @MessagePattern(IdentityMessage.DELETE_BY_ID)
  async deleteById(@Payload() id: UserId): Promise<UserDto> {
    return this.identity.deleteById(id);
  }

  @MessagePattern(IdentityMessage.LOGIN)
  async login(@Payload() data: LoginDto): Promise<TokensDto> {
    return this.identity.login(data);
  }

  @MessagePattern(IdentityMessage.REFRESH)
  async refresh(@Payload() userId: UserId): Promise<TokensDto> {
    return this.identity.refresh(userId);
  }
}
