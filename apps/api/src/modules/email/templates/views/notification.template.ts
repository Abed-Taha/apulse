import type { EmailTemplateDefinition } from '../email-template.types.js';

export const notificationTemplate: EmailTemplateDefinition = {
  subject: '{{title}}',

  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h1>{{title}}</h1>

      <p>Hello {{name}},</p>

      <p>{{message}}</p>

      {{#if actionUrl}}
        <a href="{{actionUrl}}">{{actionLabel}}</a>
      {{/if}}

      <p>Thank you for using Apulse.</p>
    </div>
  `,

  text: `
    {{title}}

    Hello {{name}},

    {{message}}

    {{#if actionUrl}}
      {{actionLabel}}: {{actionUrl}}
    {{/if}}

    Thank you for using Apulse.
  `,
};
