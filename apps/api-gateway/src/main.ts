import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { ConfigService } from '@app/shared/config/config.service';
import { RpcToHttpExceptionFilter } from '@app/shared/filters/rpc-to-http-exception.filter';
import { RpcClientErrorInterceptor } from '@app/shared/interceptors/rpc-client-error.interceptor';

import { ApiGatewayModule } from './api-gateway.module';
import { JwtAccessAuthGuard } from './auth/jwt-access.guard';

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

  await app.listen(PORT, HOST);
}
void bootstrap();
