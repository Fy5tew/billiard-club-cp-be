import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { EmailNotificationDto } from '@app/shared/dtos/notification.dto';
import { NotificationMessage } from '@app/shared/messages/notification.messages';

import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern(NotificationMessage.SEND_EMAIL)
  async sendEmail(@Payload() data: EmailNotificationDto): Promise<void> {
    await this.notificationService.sendEmail(data);
  }
}
