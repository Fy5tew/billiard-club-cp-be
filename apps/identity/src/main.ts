import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { ConfigService } from '@app/shared/config/config.service';
import { HttpToRpcExceptionFilter } from '@app/shared/filters/http-to-rpc-exception.filter';

import { IdentityModule } from './identity.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(IdentityModule);

  const configService = appContext.get(ConfigService);

  const { RMQ_QUEUE } = configService.IDENTITY;
  const { HOST, PORT, USER, PASSWORD } = configService.RABBITMQ;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IdentityModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${USER}:${PASSWORD}@${HOST}:${PORT}`],
        queue: RMQ_QUEUE,
        queueOptions: { durable: true },
      },
    },
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(appContext.get(Reflector)),
  );

  app.useGlobalFilters(new HttpToRpcExceptionFilter());

  await app.listen();
}
void bootstrap();
