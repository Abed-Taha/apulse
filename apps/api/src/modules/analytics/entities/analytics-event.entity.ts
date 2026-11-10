import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { VisitorSession } from './visitor-session.entity.js';

@Entity('analytics_events')
@Index('IDX_analytics_events_session_created', ['sessionId', 'createdAt'])
@Index('IDX_analytics_events_event_name', ['eventName'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => VisitorSession, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: VisitorSession;

  @Column({ name: 'event_name', type: 'varchar', length: 100 })
  eventName: string;

  @Column({ name: 'page_url', type: 'text' })
  pageUrl: string;

  @Column({ name: 'event_data', type: 'jsonb', nullable: true })
  eventData: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
