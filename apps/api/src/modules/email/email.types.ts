import type {
  EmailTemplateName,
  EmailTemplateContextMap,
} from './templates/email-template.types.js';

export type EmailRecipient = string | string[];

export interface EmailMessageOptions {
  to: EmailRecipient;
  subject: string;
  text?: string;
  html?: string;
  cc?: EmailRecipient;
  bcc?: EmailRecipient;
  replyTo?: string;
}

export interface SendTemplateEmailOptions<
  T extends EmailTemplateName = EmailTemplateName,
> {
  to: EmailRecipient;
  template: T;
  context: EmailTemplateContextMap[T];
  cc?: EmailRecipient;
  bcc?: EmailRecipient;
  replyTo?: string;
}
