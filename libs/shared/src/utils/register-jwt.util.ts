import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

export const registerJwt = () => {
  return JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      const { SECRET } = config.JWT;

      return {
        secret: SECRET,
      };
    },
  });
};
