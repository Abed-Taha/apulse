import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsDailySummary } from './entities/analytics-daily-summary.entity.js';
import { AnalyticsEvent } from './entities/analytics-event.entity.js';
import { VisitorSession } from './entities/visitor-session.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsDailySummary,
      AnalyticsEvent,
      VisitorSession,
    ]),
  ],
})
export class AnalyticsModule {}
