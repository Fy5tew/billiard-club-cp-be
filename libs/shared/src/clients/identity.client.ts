import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Service } from '../constants/service.constants';
import { CreateUserDto, UpdateUserDto, UserDto } from '../dtos/user.dto';
import { IdentityMessage } from '../messages/identity.messages';
import { UserId } from '../types/user.types';

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
}
