import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Invoice } from '../../invoice/entities/invoice.entity.js';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50 })
  paymentMethod: string;

  @Column({
    name: 'transaction_ref',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  transactionRef: string | null;

  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: string;

  @Column({
    name: 'payment_date',
    type: 'timestamptz',
    nullable: true,
  })
  paymentDate: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
