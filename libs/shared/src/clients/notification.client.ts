import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { EmailNotificationDto } from '../dtos/notification.dto';
import { NotificationMessage } from '../messages/notification.messages';
import { Service } from '../types/service.types';

@Injectable()
export class NotificationClient {
  constructor(
    @Inject(Service.NOTIFICATION) private readonly client: ClientProxy,
  ) {}

  sendEmail(data: EmailNotificationDto) {
    this.client.emit<void, EmailNotificationDto>(
      NotificationMessage.SEND_EMAIL,
      data,
    );
  }
}
