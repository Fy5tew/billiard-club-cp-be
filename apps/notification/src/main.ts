import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { ConfigService } from '@app/shared/config/config.service';
import { HttpToRpcExceptionFilter } from '@app/shared/filters/http-to-rpc-exception.filter';

import { NotificationModule } from './notification.module';

async function bootstrap() {
  const appContext =
    await NestFactory.createApplicationContext(NotificationModule);

  const configService = appContext.get(ConfigService);

  const { HOST, PORT } = configService.NOTIFICATION;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationModule,
    {
      transport: Transport.TCP,
      options: {
        host: HOST,
        port: PORT,
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
