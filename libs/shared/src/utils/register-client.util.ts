import { ClientsModule, Transport } from '@nestjs/microservices';

import { ConfigModule, ConfigService } from '../config';
import { Service } from '../constants';

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
