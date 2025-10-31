import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@app/shared/config/config.module';
import { UserEntity } from '@app/shared/entities/user.entity';
import { registerDatabase } from '@app/shared/utils/register-database.util';
import { registerJwt } from '@app/shared/utils/register-jwt.util';

import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';

@Module({
  imports: [
    ConfigModule,
    registerJwt(),
    registerDatabase(),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [IdentityService],
  controllers: [IdentityController],
})
export class IdentityModule {}
