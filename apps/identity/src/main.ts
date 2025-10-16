import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { ConfigService } from '@app/shared';

import { IdentityModule } from './identity.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(IdentityModule);

  const configService = appContext.get(ConfigService);

  const { HOST, PORT } = configService.IDENTITY;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IdentityModule,
    {
      transport: Transport.TCP,
      options: {
        host: HOST,
        port: PORT,
      },
    },
  );
  await app.listen();
}
void bootstrap();
