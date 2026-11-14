import type { EmailTemplateDefinition } from '../email-template.types.js';

export const orderConfirmationTemplate: EmailTemplateDefinition = {
  subject: 'Order {{orderNumber}} confirmed',

  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h1>Thank you, {{name}}!</h1>

      <p>Your order has been confirmed.</p>

      <p><strong>Order number:</strong> {{orderNumber}}</p>

      <h2>Order Details</h2>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th align="left">Product</th>
            <th align="center">Quantity</th>
            <th align="right">Price</th>
          </tr>
        </thead>

        <tbody>
          {{#each items}}
            <tr>
              <td>{{name}}</td>
              <td align="center">{{quantity}}</td>
              <td align="right">{{price}}</td>
            </tr>
          {{/each}}
        </tbody>
      </table>

      <h3>Total: {{total}}</h3>

      <a href="{{orderUrl}}">View Order</a>
    </div>
  `,

  text: `
    Thank you, {{name}}!

    Your order has been confirmed.

    Order number: {{orderNumber}}

    {{#each items}}
      {{name}} - Quantity: {{quantity}} - Price: {{price}}
    {{/each}}

    Total: {{total}}

    View your order: {{orderUrl}}
  `,
};
