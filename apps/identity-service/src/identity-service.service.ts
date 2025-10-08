import { Injectable } from '@nestjs/common';

@Injectable()
export class IdentityServiceService {
  getHello(): string {
    return 'Identity Service is running!';
  }
}
