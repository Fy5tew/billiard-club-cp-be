import { Injectable } from '@nestjs/common';
import dotenv from 'dotenv';
import nconf from 'nconf';

import { NESTED_VALUE_SEPARATOR } from './config.constants';
import { Config, configSchema } from './config.validation';

dotenv.config();

nconf.env({
  separator: NESTED_VALUE_SEPARATOR,
  parseValues: true,
});

@Injectable()
export class ConfigService implements Config {
  DB: Config['DB'];
  JWT: Config['JWT'];
  API_GATEWAY: Config['API_GATEWAY'];
  IDENTITY: Config['IDENTITY'];

  constructor() {
    const config = configSchema.parse(nconf.get());
    Object.assign(this, config);
  }
}
