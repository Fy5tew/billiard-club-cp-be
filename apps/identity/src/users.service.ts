import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
} from '@app/shared/dtos/user.dto';
import { UserEntity } from '@app/shared/entities/user.entity';

import { HASH_ROUNDS } from './identity.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, HASH_ROUNDS);
  }

  private async comparePasswords(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async create({ password, ...data }: CreateUserDto): Promise<UserEntity> {
    const user = this.users.create({
      ...data,
      password: await this.hashPassword(password),
    });
    return await this.users.save(user);
  }

  async update({ id, ...data }: UpdateUserDto): Promise<UserEntity> {
    const user = await this.getById(id);

    return await this.users.save({
      ...user,
      ...data,
    });
  }

  async getById(id: UserDto['id']): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async deleteById(id: UserDto['id']): Promise<UserEntity> {
    const user = await this.getById(id);

    await this.users.remove(user);

    return user;
  }
}
