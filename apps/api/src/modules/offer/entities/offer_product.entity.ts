import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity.js';
import { Offer } from './offer.entity.js';

@Entity('offer_product')
export class OfferProduct {
  @PrimaryColumn({ name: 'offer_id', type: 'uuid' })
  offerId: number;

  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_id' })
  offer: Offer;
}
