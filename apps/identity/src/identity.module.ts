import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, registerDatabase, UserEntity } from '@app/shared';

import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';

@Module({
  imports: [
    ConfigModule,
    registerDatabase(),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [IdentityController],
  providers: [IdentityService],
})
export class IdentityModule {}
