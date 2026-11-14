export type EmailTemplateName =
  | 'welcome'
  | 'verification'
  | 'password-reset'
  | 'order-confirmation'
  | 'notification';

export interface WelcomeTemplateContext {
  name: string;
  appUrl: string;
}

export interface VerificationTemplateContext {
  name: string;
  verificationUrl: string;
  expiresIn: string;
}

export interface PasswordResetTemplateContext {
  name: string;
  resetUrl: string;
  expiresIn: string;
}

export interface OrderConfirmationItem {
  name: string;
  quantity: number;
  price: string;
}

export interface OrderConfirmationTemplateContext {
  name: string;
  orderNumber: string;
  items: OrderConfirmationItem[];
  total: string;
  orderUrl: string;
}

export interface NotificationTemplateContext {
  name: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface EmailTemplateContextMap {
  welcome: WelcomeTemplateContext;
  verification: VerificationTemplateContext;
  'password-reset': PasswordResetTemplateContext;
  'order-confirmation': OrderConfirmationTemplateContext;
  notification: NotificationTemplateContext;
}

export interface EmailTemplateDefinition {
  subject: string;
  html: string;
  text: string;
}
