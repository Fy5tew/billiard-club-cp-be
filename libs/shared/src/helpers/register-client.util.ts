import { ClientsModule, Transport } from '@nestjs/microservices';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { Service } from '../services/services.types';

export const registerClient = (service: Service) => {
  return ClientsModule.registerAsync([
    {
      name: service,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { RMQ_QUEUE } = configService[service];
        const { HOST, PORT, USER, PASSWORD } = configService.RABBITMQ;

        return {
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${USER}:${PASSWORD}@${HOST}:${PORT}`],
            queue: RMQ_QUEUE,
            queueOptions: { durable: true },
          },
        };
      },
    },
  ]);
};
