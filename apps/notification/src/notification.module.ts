import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

import { ConfigModule } from '@app/shared/config/config.module';
import { ConfigService } from '@app/shared/config/config.service';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const { HOST, PORT, USER, PASSWORD, SECURE } = config.MAIL_SERVER;
        const { SENDER_NAME, SENDER_EMAIL } = config.NOTIFICATION;

        return {
          transport: {
            host: HOST,
            port: PORT,
            auth: {
              user: USER,
              pass: PASSWORD,
            },
            secure: SECURE,
            ignoreTLS: !SECURE,
          },
          defaults: {
            from: `${SENDER_NAME} ${SENDER_EMAIL}`,
          },
        };
      },
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
