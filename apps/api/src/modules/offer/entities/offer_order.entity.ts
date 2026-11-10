import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Offer } from '../../offer/entities/offer.entity.js';
import { Order } from '../../order/entities/order.entity.js';

@Entity('offer_orders')
@Unique('UQ_offer_order', ['orderId', 'offerId'])
export class OfferOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Offer, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'offer_id' })
  offer: Offer;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'offer_id', type: 'uuid' })
  offerId: string;
}
