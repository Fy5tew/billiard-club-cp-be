import { IsEmail } from 'class-validator';

export enum EmailContentType {
  TEXT = 'text',
  HTML = 'html',
}

export class EmailNotificationDto {
  @IsEmail()
  to: string;

  type?: EmailContentType;

  subject?: string;

  message: string;
}
