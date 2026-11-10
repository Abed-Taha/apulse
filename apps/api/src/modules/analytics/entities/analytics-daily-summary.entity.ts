import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('analytics_daily_summaries')
@Index('UQ_analytics_daily_summaries_date', ['date'], { unique: true })
export class AnalyticsDailySummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: string;

  @Column({ type: 'integer', default: 0 })
  visitors: number;

  @Column({ type: 'integer', default: 0 })
  sessions: number;

  @Column({ name: 'page_views', type: 'integer', default: 0 })
  pageViews: number;

  @Column({ name: 'new_users', type: 'integer', default: 0 })
  newUsers: number;

  @Column({ type: 'integer', default: 0 })
  orders: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  revenue: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
