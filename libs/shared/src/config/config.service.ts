import { Injectable } from '@nestjs/common';
import dotenv from 'dotenv';
import nconf from 'nconf';

import { Config, configSchema } from './config.validation';

dotenv.config();

nconf.env({
  separator: '__',
  parseValues: true,
});

@Injectable()
export class ConfigService implements Config {
  DB: Config['DB'];
  API_GATEWAY: Config['API_GATEWAY'];
  IDENTITY: Config['IDENTITY'];

  constructor() {
    const config = configSchema.parse(nconf.get());
    Object.assign(this, config);
  }
}
