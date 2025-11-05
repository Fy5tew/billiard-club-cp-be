import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';

describe(AuthController.name, () => {
  let authController: AuthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('root', () => {
    it('should be truthy', () => {
      expect(authController).toBeTruthy();
    });
  });
});
