import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { ConfigService } from '@app/shared/config/config.service';
import { LoginDto, TokensDto } from '@app/shared/dtos/auth.dto';
import type {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserPhotoDto,
  UserId,
} from '@app/shared/dtos/user.dto';
import { UserDto } from '@app/shared/dtos/user.dto';
import { UserEntity } from '@app/shared/entities/user.entity';
import { CatchDatabaseError } from '@app/shared/helpers/catch-database-error.decorator';
import { NotificationClient } from '@app/shared/services/notification/notification.client';
import { StorageClient } from '@app/shared/services/storage/storage.client';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenType,
} from '@app/shared/types/auth.types';
import { DatabaseErrorCode } from '@app/shared/types/database-error.types';

import { BUCKET_NAME } from './identity.constants';
import { getUserProfilePhotoPath } from './identity.utils';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly notificationClient: NotificationClient,
    private readonly storageClient: StorageClient,
  ) {}

  async create(data: CreateUserDto): Promise<UserDto> {
    return await this.mapUserEntityToDto(await this.createEntity(data));
  }

  async updateById(id: UserId, data: UpdateUserDto): Promise<UserDto> {
    return await this.mapUserEntityToDto(await this.updateEntityById(id, data));
  }

  async updatePhotoById(
    id: UserId,
    data: UpdateUserPhotoDto,
  ): Promise<UserDto> {
    return await this.mapUserEntityToDto(
      await this.updateEntityPhotoById(id, data),
    );
  }

  async deletePhotoById(id: UserId) {
    return await this.mapUserEntityToDto(await this.deleteEntityPhotoById(id));
  }

  async getById(id: UserId): Promise<UserDto> {
    return await this.mapUserEntityToDto(await this.getEntityById(id));
  }

  async deleteById(id: UserId): Promise<UserDto> {
    return await this.mapUserEntityToDto(await this.deleteEntityById(id));
  }

  async login({ email, password }: LoginDto): Promise<TokensDto> {
    try {
      const user = await this.getEntityByEmail(email);
      const isValidPassword = await this.comparePasswords(
        password,
        user.password,
      );

      if (!isValidPassword) {
        throw new UnauthorizedException('Invalid creadentials');
      }

      return this.generateTokens(await this.mapUserEntityToDto(user));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid credentials');
      }

      throw error;
    }
  }

  async refresh(userId: UserId): Promise<TokensDto> {
    const user = await this.getEntityById(userId);

    return this.generateTokens(await this.mapUserEntityToDto(user));
  }

  async getUsers(): Promise<UserDto[]> {
    const users = await this.users.find();

    return Promise.all(users.map((user) => this.mapUserEntityToDto(user)));
  }

  @CatchDatabaseError(
    DatabaseErrorCode.UNIQUE_VIOLATION,
    ({ args: [{ email }] }) => {
      throw new ConflictException(`User with email '${email}' already exists`);
    },
  )
  private async createEntity({
    password,
    ...data
  }: CreateUserDto): Promise<UserEntity> {
    const user = this.users.create({
      ...data,
      password: await this.hashPassword(password),
    });
    const newUser = await this.users.save(user);
    this.sendWelcomeEmail(await this.mapUserEntityToDto(user));
    return newUser;
  }

  private async updateEntityById(
    id: UserId,
    data: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.getEntityById(id);

    Object.assign(user, data);

    return await this.users.save(user);
  }

  private async updateEntityPhotoById(
    id: UserId,
    { filename: originalFilename, buffer, mimeType }: UpdateUserPhotoDto,
  ): Promise<UserEntity> {
    const user = await this.getEntityById(id);

    const newProfileFilename = `${uuid()}-${originalFilename}`;
    const photoPath = getUserProfilePhotoPath(id, newProfileFilename);

    await this.storageClient.uploadFile({
      bucket: BUCKET_NAME,
      filename: photoPath,
      buffer,
      mimeType,
    });

    if (user.photoFilename) {
      this.storageClient.deleteFile({
        bucket: BUCKET_NAME,
        filename: user.photoFilename,
      });
    }

    user.photoFilename = newProfileFilename;

    return await this.users.save(user);
  }

  private async deleteEntityPhotoById(id: UserId): Promise<UserEntity> {
    const user = await this.getEntityById(id);

    user.photoFilename = null;

    return await this.users.save(user);
  }

  @CatchDatabaseError(
    DatabaseErrorCode.INVALID_TEXT_REPRESENTATION,
    ({ args: [id] }) => {
      throw new BadRequestException(
        `Invalid UUID format provided for user ID: '${id}'`,
      );
    },
  )
  private async getEntityById(id: UserId): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id '${id}' does not exist`);
    }

    return user;
  }

  private async getEntityByEmail(email: string): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with enail '${email}' does not exist`);
    }

    return user;
  }

  private async deleteEntityById(id: UserId): Promise<UserEntity> {
    const user = await this.getEntityById(id);

    await this.users.remove(user);

    return user;
  }

  private async mapUserEntityToDto(userEntity: UserEntity): Promise<UserDto> {
    const userDto = plainToInstance(UserDto, userEntity, {
      excludeExtraneousValues: true,
    });

    const { id, photoFilename } = userEntity;

    userDto.photoUrl = photoFilename
      ? await this.storageClient.getFileUrl({
          bucket: BUCKET_NAME,
          filename: getUserProfilePhotoPath(id, photoFilename),
        })
      : null;

    return userDto;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  private async comparePasswords(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async generateTokens(user: UserDto): Promise<TokensDto> {
    return {
      accessToken: await this.generateAccessToken(user),
      refreshToken: await this.generateRefreshToken(user),
    };
  }

  private async generateAccessToken(user: UserDto): Promise<string> {
    const { ACCESS_EXPIRES } = this.config.JWT;

    return await this.jwtService.signAsync<AccessTokenPayload>(
      {
        tokenType: TokenType.ACCESS,
        user,
      },
      { expiresIn: ACCESS_EXPIRES },
    );
  }

  private async generateRefreshToken({ id }: UserDto): Promise<string> {
    const { REFRESH_EXPIRES } = this.config.JWT;

    return await this.jwtService.signAsync<RefreshTokenPayload>(
      {
        tokenType: TokenType.REFRESH,
        userId: id,
      },
      { expiresIn: REFRESH_EXPIRES },
    );
  }

  private sendWelcomeEmail({ email }: UserDto) {
    this.notificationClient.sendEmail({
      to: email,
      subject: 'Welcome on board',
      message: 'Hello, new client!',
    });
  }
}
