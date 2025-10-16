import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Service } from '../constants';
import { IdentityMessage } from '../messages';

@Injectable()
export class IdentityClient {
  constructor(@Inject(Service.IDENTITY) private readonly client: ClientProxy) {}

  async getHello(): Promise<string> {
    return firstValueFrom(
      this.client.send<string>(IdentityMessage.GET_HELLO, {}),
    );
  }
}
