import { Test, TestingModule } from '@nestjs/testing';

import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

describe(StorageController.name, () => {
  let storageController: StorageController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [StorageService],
    }).compile();

    storageController = app.get<StorageController>(StorageController);
  });

  describe('root', () => {
    it('should be truthy', () => {
      expect(storageController).toBeTruthy();
    });
  });
});
