import { Test, TestingModule } from '@nestjs/testing';

import { IdentityController } from './identity.controller';

describe('IdentityController', () => {
  let identityController: IdentityController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [IdentityController],
    }).compile();

    identityController = app.get<IdentityController>(IdentityController);
  });

  describe('root', () => {
    it('should be truthy', () => {
      expect(identityController).toBeTruthy();
    });
  });
});
