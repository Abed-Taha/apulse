import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visitor } from './entities/visitor.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Visitor])],
})
export class VisitorModule {}
