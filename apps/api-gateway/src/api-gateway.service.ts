import { Injectable } from '@nestjs/common';

import { IdentityClient } from '@app/shared';

@Injectable()
export class ApiGatewayService {
  constructor(private readonly identityClient: IdentityClient) {}

  async getHello(): Promise<string> {
    return this.identityClient.getHello();
  }
}
