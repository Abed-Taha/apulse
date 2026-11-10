import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity.js';
import { OfferProduct } from './entities/offer_product.entity.js';
import { OfferOrder } from './entities/offer_order.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, OfferProduct, OfferOrder])],
})
export class OfferModule {}
