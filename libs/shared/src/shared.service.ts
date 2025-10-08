import { Injectable } from '@nestjs/common';

@Injectable()
export class SharedService {
  getMessage(): string {
    return 'Shared Message';
  }
}
