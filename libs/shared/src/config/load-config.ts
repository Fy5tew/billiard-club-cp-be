import dotenv from 'dotenv';
import nconf from 'nconf';

import { NESTED_VALUE_SEPARATOR } from './config.constants';
import { Config, configSchema } from './config.validation';

dotenv.config();

nconf.env({
  separator: NESTED_VALUE_SEPARATOR,
  parseValues: true,
});

export const loadConfig = (): Config => {
  return configSchema.parse(nconf.get());
};
