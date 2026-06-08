import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { config } from 'src/config';
import { AnalyticsProcessor } from './analytics.processor';
import { ANALYTICS_QUEUE } from 'src/utils/constant';

@Module({
  imports: [
    BullModule.forRoot({
      connection: { url: config.redisUrl },
    }),
    BullModule.registerQueue({ name: ANALYTICS_QUEUE }),
  ],
  providers: [AnalyticsProcessor],
  exports: [BullModule],
})
export class QueueModule {}
