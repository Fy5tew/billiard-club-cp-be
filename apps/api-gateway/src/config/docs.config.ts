import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Response } from 'express';

import { JWT_REFRESH_TOKEN_COOKIE } from '../auth/auth.constants';
import { DocsRoute } from '../constants/docs.constants';

export const setupDocs = (app: INestApplication) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BilliardClubControllPanel.API')
    .setVersion('1.0')
    .setDescription('Api Documentstion')
    .setExternalDoc('OpenAPI JSON', DocsRoute.OPENAPI)
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addCookieAuth(JWT_REFRESH_TOKEN_COOKIE)
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup(DocsRoute.SWAGGER, app, swaggerDocument, {
    swaggerOptions: {
      defaultModelExpandDepth: true,
      persistAuthorization: true,
    },
  });

  app
    .getHttpAdapter()
    .get(DocsRoute.OPENAPI, (_, response: Response) =>
      response.json(swaggerDocument),
    );
};
