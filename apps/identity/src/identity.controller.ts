import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
} from '@app/shared/dtos/user.dto';
import { IdentityMessage } from '@app/shared/messages/identity.messages';

import { UsersService } from './users.service';

@Controller()
export class IdentityController {
  constructor(private readonly users: UsersService) {}

  @MessagePattern(IdentityMessage.REGISTER)
  async register(@Payload() data: CreateUserDto): Promise<UserDto> {
    return this.users.create(data);
  }

  @MessagePattern(IdentityMessage.UPDATE)
  async update(@Payload() data: UpdateUserDto) {
    return this.users.update(data);
  }

  @MessagePattern(IdentityMessage.GET_BY_ID)
  async getById(@Payload() id: UserDto['id']): Promise<UserDto> {
    return this.users.getById(id);
  }

  @MessagePattern(IdentityMessage.DELETE_BY_ID)
  async deleteById(@Payload() id: UserDto['id']): Promise<UserDto> {
    return this.users.deleteById(id);
  }
}
