import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@app/shared';

import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const appContext =
    await NestFactory.createApplicationContext(ApiGatewayModule);

  const configService = appContext.get(ConfigService);

  const { HOST, PORT } = configService.API_GATEWAY;

  const app = await NestFactory.create(ApiGatewayModule);
  await app.listen(PORT, HOST);
}
void bootstrap();
