import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailService } from './email.service.js';
import { EmailTransport } from './email.transport.js';
import { EmailTemplateService } from './templates/email-template.service.js';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, EmailTransport, EmailTemplateService],
  exports: [EmailService],
})
export class EmailModule {}
