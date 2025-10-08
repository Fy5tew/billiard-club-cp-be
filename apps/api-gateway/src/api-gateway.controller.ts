import { Controller, Get } from '@nestjs/common';

import { SharedService } from '@app/shared';

import { ApiGatewayService } from './api-gateway.service';

@Controller()
export class ApiGatewayController {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,
    private readonly sharedService: SharedService,
  ) {}

  @Get()
  getHello(): string {
    return this.apiGatewayService.getHello();
  }

  @Get('shared')
  getShared(): string {
    return this.sharedService.getMessage();
  }
}
