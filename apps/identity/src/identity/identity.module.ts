import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, registerDatabase, UserEntity } from '@app/shared';

import { IdentityController } from './identity.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    AuthModule,
    registerDatabase(),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [IdentityController],
})
export class IdentityModule {}
