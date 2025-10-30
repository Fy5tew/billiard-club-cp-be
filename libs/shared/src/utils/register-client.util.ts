import { ClientsModule, Transport } from '@nestjs/microservices';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { Service } from '../constants/service.constants';

export const registerClient = (service: Service) => {
  return ClientsModule.registerAsync([
    {
      name: service,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { HOST, PORT } = configService[service];

        return {
          transport: Transport.TCP,
          options: {
            host: HOST,
            port: PORT,
          },
        };
      },
    },
  ]);
};
