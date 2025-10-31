import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { LoginDto, TokensDto } from '@app/shared/dtos/auth.dto';
import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
} from '@app/shared/dtos/user.dto';
import { IdentityMessage } from '@app/shared/messages/identity.messages';
import type { UserId } from '@app/shared/types/user.types';

import { IdentityService } from './identity.service';

@Controller()
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @MessagePattern(IdentityMessage.REGISTER)
  async register(@Payload() data: CreateUserDto): Promise<UserDto> {
    return this.identity.create(data);
  }

  @MessagePattern(IdentityMessage.UPDATE)
  async update(@Payload() [id, data]: [UserId, UpdateUserDto]) {
    return this.identity.update(id, data);
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
