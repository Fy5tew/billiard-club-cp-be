import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

export const registerDatabase = () => {
  return TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      const { HOST, PORT, USER, PASSWORD, NAME } = config.DB;

      return {
        type: 'postgres',
        host: HOST,
        port: PORT,
        username: USER,
        password: PASSWORD,
        database: NAME,
        autoLoadEntities: true,
      };
    },
  });
};
