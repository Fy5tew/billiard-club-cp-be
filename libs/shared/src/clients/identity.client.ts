import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { LoginDto, TokensDto } from '../dtos/auth.dto';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  UserId,
} from '../dtos/user.dto';
import { IdentityMessage } from '../messages/identity.messages';
import { Service } from '../types/service.types';

@Injectable()
export class IdentityClient {
  constructor(@Inject(Service.IDENTITY) private readonly client: ClientProxy) {}

  async register(data: CreateUserDto): Promise<UserDto> {
    return firstValueFrom(
      this.client.send<UserDto, CreateUserDto>(IdentityMessage.REGISTER, data),
    );
  }

  async update(id: UserId, data: UpdateUserDto): Promise<UserDto> {
    return firstValueFrom(
      this.client.send<UserDto, [UserId, UpdateUserDto]>(
        IdentityMessage.UPDATE,
        [id, data],
      ),
    );
  }

  async getById(id: UserId): Promise<UserDto> {
    return firstValueFrom(
      this.client.send<UserDto, UserId>(IdentityMessage.GET_BY_ID, id),
    );
  }

  async deleteById(id: UserId): Promise<UserDto> {
    return firstValueFrom(
      this.client.send<UserDto, UserId>(IdentityMessage.DELETE_BY_ID, id),
    );
  }

  async login(data: LoginDto): Promise<TokensDto> {
    return firstValueFrom(
      this.client.send<TokensDto, LoginDto>(IdentityMessage.LOGIN, data),
    );
  }

  async refresh(userId: UserId): Promise<TokensDto> {
    return firstValueFrom(
      this.client.send<TokensDto, UserId>(IdentityMessage.REFRESH, userId),
    );
  }
}
