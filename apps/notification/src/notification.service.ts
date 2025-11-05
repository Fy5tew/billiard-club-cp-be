import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import {
  EmailContentType,
  EmailNotificationDto,
} from '@app/shared/dtos/notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail({
    to,
    type = EmailContentType.TEXT,
    subject,
    message,
  }: EmailNotificationDto): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      [type]: message,
    });
  }
}
