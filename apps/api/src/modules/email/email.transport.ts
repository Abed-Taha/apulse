import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type SendMailOptions, type Transporter } from 'nodemailer';

import { EMAIL_CONFIG } from './email.constants.js';

@Injectable()
export class EmailTransport implements OnModuleInit {
  private readonly logger = new Logger(EmailTransport.name);
  private readonly enabled: boolean;
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.resolveEnabled();

    if (!this.enabled) {
      this.transporter = null;
      return;
    }

    const host = this.configService.get<string>(EMAIL_CONFIG.HOST);
    if (!host?.trim()) {
      throw new Error('SMTP_HOST is required when EMAIL_ENABLED=true.');
    }

    const portValue = this.configService.get<string>(EMAIL_CONFIG.PORT);
    if (!portValue?.trim()) {
      throw new Error('SMTP_PORT is required when EMAIL_ENABLED=true.');
    }
    const port = Number(portValue);

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

  isEnabled(): boolean {
    return this.enabled;
  }

  onModuleInit(): void {
    if (!this.transporter) {
      this.logger.log('Email sending is disabled.');
      return;
    }

    this.logger.log(
      'Email sending is enabled; SMTP connectivity will be checked when sending.',
    );
  }

  async send(options: SendMailOptions) {
    if (!this.transporter) {
      throw new ServiceUnavailableException(
        'Email sending is disabled. Set EMAIL_ENABLED=true to enable it.',
      );
    }

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

  private resolveEnabled(): boolean {
    const configuredValue = this.configService.get<string>(
      EMAIL_CONFIG.ENABLED,
    );

    if (configuredValue === undefined) {
      const nodeEnv =
        this.configService.get<string>('NODE_ENV') ??
        process.env.NODE_ENV ??
        'development';

      return nodeEnv.toLowerCase() !== 'production';
    }

    const normalizedValue = configuredValue.trim().toLowerCase();
    if (normalizedValue === 'true') {
      return true;
    }
    if (normalizedValue === 'false') {
      return false;
    }

    throw new Error('EMAIL_ENABLED must be either "true" or "false".');
  }
}
