import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('visitors')
@Index('UQ_visitors_visitor_token', ['visitorToken'], { unique: true })
export class Visitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'visitor_token',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  visitorToken: string;

  @Column({ name: 'first_visit_at', type: 'timestamptz' })
  firstVisitAt: Date;

  @Column({ name: 'last_visit_at', type: 'timestamptz' })
  lastVisitAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
