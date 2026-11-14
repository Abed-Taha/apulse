import type { EmailTemplateDefinition } from '../email-template.types.js';

export const verificationTemplate: EmailTemplateDefinition = {
  subject: 'Verify your Apulse email address',

  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h1>Hello {{name}},</h1>

      <p>Please verify your email address to activate your account.</p>

      <a href="{{verificationUrl}}"
         style="display: inline-block; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none;">
        Verify Email
      </a>

      <p>This link expires in {{expiresIn}}.</p>

      <p>If you did not create an account, you can ignore this email.</p>
    </div>
  `,

  text: `
    Hello {{name}},

    Please verify your email address.

    Verification link: {{verificationUrl}}

    This link expires in {{expiresIn}}.

    If you did not create an account, you can ignore this email.
  `,
};
