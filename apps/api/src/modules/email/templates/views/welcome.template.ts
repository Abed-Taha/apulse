import type { EmailTemplateDefinition } from '../email-template.types.js';

export const welcomeTemplate: EmailTemplateDefinition = {
  subject: 'Welcome to Apulse, {{name}}!',

  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h1>Welcome to Apulse, {{name}}!</h1>

      <p>We're happy to have you with us.</p>

      <p>
        You can now access your Apulse account and start exploring.
      </p>

      <a href="{{appUrl}}">Visit Apulse</a>

      <p>Thank you for joining us!</p>
    </div>
  `,

  text: `
    Welcome to Apulse, {{name}}!

    We're happy to have you with us.

    Visit Apulse: {{appUrl}}

    Thank you for joining us!
  `,
};
