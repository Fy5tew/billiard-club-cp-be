import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Service } from '../constants';
import { CreateUserDto, UpdateUserDto, UserDto } from '../dtos';
import { IdentityMessage } from '../messages';

@Injectable()
export class IdentityClient {
  constructor(@Inject(Service.IDENTITY) private readonly client: ClientProxy) {}

  async register(data: CreateUserDto): Promise<UserDto> {
    return firstValueFrom(
      this.client.send<UserDto, CreateUserDto>(IdentityMessage.REGISTER, data),
    );
  }

  async update(data: UpdateUserDto): Promise<UserDto> {
    return firstValueFrom(
      this.client.send<UserDto, UpdateUserDto>(IdentityMessage.UPDATE, data),
    );
  }

  async getById(id: UserDto['id']): Promise<UserDto> {
    return firstValueFrom(
      this.client.send<UserDto, UserDto['id']>(IdentityMessage.GET_BY_ID, id),
    );
  }

  async deleteById(id: UserDto['id']): Promise<UserDto> {
    return firstValueFrom(
      this.client.send<UserDto, UserDto['id']>(
        IdentityMessage.DELETE_BY_ID,
        id,
      ),
    );
  }
}
