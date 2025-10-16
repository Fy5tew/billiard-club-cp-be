import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { IdentityMessage } from '@app/shared';

import { IdentityService } from './identity.service';

@Controller()
export class IdentityController {
  constructor(private readonly IdentityService: IdentityService) {}

  @MessagePattern(IdentityMessage.GET_HELLO)
  getHello(): string {
    return this.IdentityService.getHello();
  }
}
