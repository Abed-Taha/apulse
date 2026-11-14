import type { EmailTemplateDefinition } from '../email-template.types.js';

export const passwordResetTemplate: EmailTemplateDefinition = {
  subject: 'Reset your Apulse password',

  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h1>Hello {{name}},</h1>

      <p>We received a request to reset your password.</p>

      <a href="{{resetUrl}}"
         style="display: inline-block; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none;">
        Reset Password
      </a>

      <p>This link expires in {{expiresIn}}.</p>

      <p>If you did not request a password reset, you can ignore this email.</p>
    </div>
  `,

  text: `
    Hello {{name}},

    We received a request to reset your password.

    Reset your password: {{resetUrl}}

    This link expires in {{expiresIn}}.

    If you did not request a password reset, you can ignore this email.
  `,
};
