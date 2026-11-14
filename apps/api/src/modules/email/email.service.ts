import { BadRequestException, Injectable } from '@nestjs/common';
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
  private readonly from: string;

  constructor(
    private readonly transport: EmailTransport,
    private readonly templateService: EmailTemplateService,
    private readonly configService: ConfigService,
  ) {
    this.from = this.configService.getOrThrow<string>(EMAIL_CONFIG.FROM);
  }

  async send(options: EmailMessageOptions) {
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

    return this.transport.send({
      from: this.from,
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
