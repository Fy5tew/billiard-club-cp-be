import 'reflect-metadata';

import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { ConfigService } from '@app/shared/config/config.service';
import { RpcClientErrorInterceptor } from '@app/shared/helpers/rpc-client-error.interceptor';
import { RpcToHttpExceptionFilter } from '@app/shared/helpers/rpc-to-http-exception.filter';

import { ApiGatewayModule } from './api-gateway.module';
import { JwtAccessAuthGuard } from './auth/jwt-access.guard';
import { setupDocs } from './config/docs.config';

async function bootstrap() {
  const appContext =
    await NestFactory.createApplicationContext(ApiGatewayModule);

  const configService = appContext.get(ConfigService);

  const { HOST, PORT } = configService.API_GATEWAY;

  const app = await NestFactory.create(ApiGatewayModule);

  app.useGlobalGuards(new JwtAccessAuthGuard(appContext.get(Reflector)));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(appContext.get(Reflector)),
    new RpcClientErrorInterceptor(),
  );
  app.useGlobalFilters(new RpcToHttpExceptionFilter());

  app.use(cookieParser());

  setupDocs(app);

  await app.listen(PORT, HOST);
}
void bootstrap();
