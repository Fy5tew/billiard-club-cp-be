import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { NotificationMessage } from './notification.messages';
import { EmailNotificationDto } from '../../dtos/notification.dto';
import { Service } from '../services.types';

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
