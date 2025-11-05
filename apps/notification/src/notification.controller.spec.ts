import { Test, TestingModule } from '@nestjs/testing';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

describe(NotificationController.name, () => {
  let notificationController: NotificationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [NotificationService],
    }).compile();

    notificationController = app.get<NotificationController>(
      NotificationController,
    );
  });

  describe('root', () => {
    it('should be truthy', () => {
      expect(notificationController).toBeTruthy();
    });
  });
});
