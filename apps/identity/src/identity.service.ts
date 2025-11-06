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

import { ConfigService } from '@app/shared/config/config.service';
import { LoginDto, TokensDto } from '@app/shared/dtos/auth.dto';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserId,
} from '@app/shared/dtos/user.dto';
import { UserDto } from '@app/shared/dtos/user.dto';
import { UserEntity } from '@app/shared/entities/user.entity';
import { CatchDatabaseError } from '@app/shared/helpers/catch-database-error.decorator';
import { NotificationClient } from '@app/shared/services/notification/notification.client';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenType,
} from '@app/shared/types/auth.types';
import { DatabaseErrorCode } from '@app/shared/types/database-error.types';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly notificationClient: NotificationClient,
  ) {}

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

  private async generateAccessToken(user: UserDto): Promise<string> {
    const { ACCESS_EXPIRES } = this.config.JWT;

    return await this.jwtService.signAsync<AccessTokenPayload>(
      {
        tokenType: TokenType.ACCESS,
        user: plainToInstance(UserDto, user, { excludeExtraneousValues: true }),
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

  private async generateTokens(user: UserDto): Promise<TokensDto> {
    return {
      accessToken: await this.generateAccessToken(user),
      refreshToken: await this.generateRefreshToken(user),
    };
  }

  private sendWelcomeEmail({ email }: UserDto) {
    this.notificationClient.sendEmail({
      to: email,
      subject: 'Welcome on board',
      message: 'Hello, new client!',
    });
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
    const newUser = await this.users.save(user);
    this.sendWelcomeEmail(newUser);
    return newUser;
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
        `Invalid UUID format provided for user ID: '${id}'`,
      );
    },
  )
  async getById(id: UserId): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id '${id}' does not exist`);
    }

    return user;
  }

  async getByEmail(email: string): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with enail '${email}' does not exist`);
    }

    return user;
  }

  async deleteById(id: UserId): Promise<UserEntity> {
    const user = await this.getById(id);

    await this.users.remove(user);

    return user;
  }

  async login({ email, password }: LoginDto): Promise<TokensDto> {
    try {
      const user = await this.getByEmail(email);
      const isValidPassword = await this.comparePasswords(
        password,
        user.password,
      );

      if (!isValidPassword) {
        throw new UnauthorizedException('Invalid creadentials');
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid credentials');
      }

      throw error;
    }
  }

  async refresh(userId: UserId): Promise<TokensDto> {
    const user = await this.getById(userId);

    return this.generateTokens(user);
  }
}
