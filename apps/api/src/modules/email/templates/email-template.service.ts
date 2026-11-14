import { Injectable, NotFoundException } from '@nestjs/common';
import Handlebars from 'handlebars';

import type {
  EmailTemplateContextMap,
  EmailTemplateDefinition,
  EmailTemplateName,
} from './email-template.types.js';

import { welcomeTemplate } from './views/welcome.template.js';
import { verificationTemplate } from './views/verification.template.js';
import { passwordResetTemplate } from './views/password-reset.template.js';
import { orderConfirmationTemplate } from './views/order-confirmation.template.js';
import { notificationTemplate } from './views/notification.template.js';

export interface RenderedEmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailTemplateService {
  private readonly templates: Record<
    EmailTemplateName,
    EmailTemplateDefinition
  > = {
    welcome: welcomeTemplate,
    verification: verificationTemplate,
    'password-reset': passwordResetTemplate,
    'order-confirmation': orderConfirmationTemplate,
    notification: notificationTemplate,
  };

  render<T extends EmailTemplateName>(
    name: T,
    context: EmailTemplateContextMap[T],
  ): RenderedEmailTemplate {
    const template = this.templates[name];

    if (!template) {
      throw new NotFoundException(`Email template "${name}" was not found.`);
    }

    const compile = (content: string): string =>
      Handlebars.compile(content)(context);

    return {
      subject: compile(template.subject),
      html: compile(template.html),
      text: compile(template.text),
    };
  }
}
