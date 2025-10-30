import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@app/shared/config/config.module';
import { UserEntity } from '@app/shared/entities/user.entity';
import { registerDatabase } from '@app/shared/utils/register-database.util';

import { AuthService } from './auth.service';
import { IdentityController } from './identity.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule,
    registerDatabase(),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [AuthService, UsersService],
  controllers: [IdentityController],
})
export class IdentityModule {}
