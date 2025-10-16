import { Test, TestingModule } from '@nestjs/testing';

import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';

describe('IdentityController', () => {
  let IdentityController: IdentityController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [IdentityController],
      providers: [IdentityService],
    }).compile();

    IdentityController = app.get<IdentityController>(IdentityController);
  });

  describe('root', () => {
    it('should return hello message', () => {
      expect(IdentityController.getHello()).toBeTruthy();
    });
  });
});
