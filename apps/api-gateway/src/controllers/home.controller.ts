import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { PublicRoute } from '../auth/auth.decorators';
import { DocsRoute } from '../constants/docs.constants';

@ApiExcludeController()
@Controller()
export class HomeController {
  @PublicRoute()
  @Redirect(DocsRoute.SWAGGER)
  @Get()
  home() {}
}
