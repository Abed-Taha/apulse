import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EMAIL_CONFIG } from './email.constants.js';
import { EmailTransport } from './email.transport.js';
import { EmailTemplateService } from './templates/email-template.service.js';

import type {
  EmailMessageOptions,
  EmailRecipient,
  SendTemplateEmailOptions,
} from './email.types.js';

@Injectable()
export class EmailService {
  private readonly from: string | null;

  constructor(
    private readonly transport: EmailTransport,
    private readonly templateService: EmailTemplateService,
    private readonly configService: ConfigService,
  ) {
    if (this.transport.isEnabled()) {
      const from = this.configService.get<string>(EMAIL_CONFIG.FROM);
      if (!from?.trim()) {
        throw new Error('MAIL_FROM is required when EMAIL_ENABLED=true.');
      }

      this.from = from;
    } else {
      this.from = null;
    }
  }

  async send(options: EmailMessageOptions) {
    this.ensureEnabled();
    this.validateRecipients(options.to);

    if (options.cc) {
      this.validateRecipients(options.cc);
    }

    if (options.bcc) {
      this.validateRecipients(options.bcc);
    }

    if (options.replyTo) {
      this.validateEmail(options.replyTo);
    }

    if (!options.subject?.trim()) {
      throw new BadRequestException('Email subject is required.');
    }

    if (!options.html && !options.text) {
      throw new BadRequestException(
        'Email must contain HTML or plain-text content.',
      );
    }

    const from = this.from;
    if (!from) {
      throw new ServiceUnavailableException('Email sender is not configured.');
    }

    return this.transport.send({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
    });
  }

  async sendTemplate<T extends SendTemplateEmailOptions['template']>(
    options: SendTemplateEmailOptions<T>,
  ) {
    this.ensureEnabled();

    const rendered = this.templateService.render(
      options.template,
      options.context,
    );

    return this.send({
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      ...rendered,
    });
  }

  private ensureEnabled(): void {
    if (!this.transport.isEnabled()) {
      throw new ServiceUnavailableException(
        'Email sending is disabled. Set EMAIL_ENABLED=true to enable it.',
      );
    }
  }

  private validateRecipients(recipients: EmailRecipient): void {
    const emails = Array.isArray(recipients) ? recipients : [recipients];

    if (emails.length === 0) {
      throw new BadRequestException(
        'At least one email recipient is required.',
      );
    }

    for (const email of emails) {
      this.validateEmail(email);
    }
  }

  private validateEmail(email: string): void {
    const normalizedEmail = email.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      throw new BadRequestException(`Invalid email address: ${email}`);
    }
  }
}
