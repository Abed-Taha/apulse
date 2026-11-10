import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Visitor } from '../../visitor/entities/visitor.entity.js';

@Entity('visitor_sessions')
@Index('IDX_visitor_sessions_visitor_started', ['visitorId', 'startedAt'])
export class VisitorSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'visitor_id', type: 'uuid' })
  visitorId: string;

  @ManyToOne(() => Visitor, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visitor_id' })
  visitor: Visitor;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @Column({ name: 'landing_page', type: 'text' })
  landingPage: string;

  @Column({ type: 'text', nullable: true })
  referrer: string | null;

  @Column({ name: 'device_type', type: 'varchar', length: 50, nullable: true })
  deviceType: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  os: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
