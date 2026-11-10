import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity.js';
import { OrderInvoice } from './entities/order-invoice.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, OrderInvoice])],
})
export class InvoiceModule {}
