import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';

import { ConfigService } from '@app/shared/config/config.service';

import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const appContext =
    await NestFactory.createApplicationContext(ApiGatewayModule);

  const configService = appContext.get(ConfigService);

  const { HOST, PORT } = configService.API_GATEWAY;

  const app = await NestFactory.create(ApiGatewayModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(appContext.get(Reflector)),
  );

  await app.listen(PORT, HOST);
}
void bootstrap();
