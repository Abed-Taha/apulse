import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'total', type: 'numeric', precision: 12, scale: 2 })
  total: number;

  @Column({ name: 'discount', nullable: true, type: 'integer' })
  discount: number;

  @Column({ name: 'available_to', nullable: false, type: 'timestamptz' })
  availableTo: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
