import { Injectable } from '@nestjs/common';

import { Config } from './config.validation';
import { loadConfig } from './load-config';

@Injectable()
export class ConfigService implements Config {
  DB: Config['DB'];
  MAIL_SERVER: Config['MAIL_SERVER'];
  S3: Config['S3'];
  RABBITMQ: Config['RABBITMQ'];
  JWT: Config['JWT'];
  API_GATEWAY: Config['API_GATEWAY'];
  IDENTITY: Config['IDENTITY'];
  NOTIFICATION: Config['NOTIFICATION'];
  STORAGE: Config['STORAGE'];

  constructor() {
    Object.assign(this, loadConfig());
  }
}
