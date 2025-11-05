import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';

describe(UsersController.name, () => {
  let usersController: UsersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
  });

  describe('root', () => {
    it('should be truthy', () => {
      expect(usersController).toBeTruthy();
    });
  });
});
