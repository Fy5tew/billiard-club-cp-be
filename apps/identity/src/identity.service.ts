import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { DatabaseErrorCode } from '@app/shared/constants/database-error.constants';
import { CatchDatabaseError } from '@app/shared/decorators/catch-database-error.decorators';
import { CreateUserDto, UpdateUserDto } from '@app/shared/dtos/user.dto';
import { UserEntity } from '@app/shared/entities/user.entity';
import type { UserId } from '@app/shared/types/user.types';

import { HASH_ROUNDS } from './identity.constants';

@Injectable()
export class IdentityService {
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

  @CatchDatabaseError(
    DatabaseErrorCode.UNIQUE_VIOLATION,
    ({ args: [{ email }] }) => {
      throw new ConflictException(`User with email '${email}' already exists`);
    },
  )
  async create({ password, ...data }: CreateUserDto): Promise<UserEntity> {
    const user = this.users.create({
      ...data,
      password: await this.hashPassword(password),
    });
    return await this.users.save(user);
  }

  async update(id: UserId, data: UpdateUserDto): Promise<UserEntity> {
    const user = await this.getById(id);

    Object.assign(user, data);

    return await this.users.save(user);
  }

  @CatchDatabaseError(
    DatabaseErrorCode.INVALID_TEXT_REPRESENTATION,
    ({ args: [id] }) => {
      throw new BadRequestException(
        `Invalid UUID format provided for user ID: ${id}`,
      );
    },
  )
  async getById(id: UserId): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} does not exist`);
    }

    return user;
  }

  async deleteById(id: UserId): Promise<UserEntity> {
    const user = await this.getById(id);

    await this.users.remove(user);

    return user;
  }
}
