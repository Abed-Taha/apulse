import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type SendMailOptions, type Transporter } from 'nodemailer';

import { EMAIL_CONFIG } from './email.constants.js';

@Injectable()
export class EmailTransport implements OnModuleInit {
  private readonly logger = new Logger(EmailTransport.name);
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.getOrThrow<string>(EMAIL_CONFIG.HOST);

    const port = Number(
      this.configService.getOrThrow<string>(EMAIL_CONFIG.PORT),
    );

    const secureValue = this.configService.get<string>(
      EMAIL_CONFIG.SECURE,
      'false',
    );

    const secure = secureValue === 'true';

    const user = this.configService.get<string>(EMAIL_CONFIG.USER);

    const password = this.configService.get<string>(EMAIL_CONFIG.PASSWORD);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('Invalid SMTP port configuration.');
    }

    if (Boolean(user) !== Boolean(password)) {
      throw new Error(
        'SMTP_USER and SMTP_PASSWORD must either both be provided or both be empty.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      ...(user && password
        ? {
            auth: {
              user,
              pass: password,
            },
          }
        : {}),
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.transporter.verify();

      this.logger.log('SMTP connection verified successfully.');
    } catch (error) {
      this.logger.error(
        'Failed to verify SMTP connection.',
        error instanceof Error ? error.stack : undefined,
      );

      throw new Error('SMTP connection verification failed.');
    }
  }

  async send(options: SendMailOptions) {
    try {
      const result = await this.transporter.sendMail(options);

      this.logger.log(
        `Email sent successfully. Message ID: ${result.messageId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        'Failed to send email.',
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }
}
