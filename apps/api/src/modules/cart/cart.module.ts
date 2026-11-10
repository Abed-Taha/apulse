import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cart])],
})
export class CartModule {}
