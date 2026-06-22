import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { config } from 'src/config';
import { AnalyticsProcessor } from './analytics.processor';
import { ANALYTICS_QUEUE } from 'src/utils/constant';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import basicAuth from 'express-basic-auth';
import rateLimit from 'express-rate-limit';

@Module({
  imports: [
    BullModule.forRoot({
      connection: { url: config.redisUrl },
    }),

    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter, // Or FastifyAdapter from `@bull-board/fastify`
      middleware: [
        basicAuth({
          users: { [config.bullBoardUser]: config.bullBoardPassword },
          challenge: true, // triggers browser login prompt
        }),
        rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 20,
          message: 'Too many requests',
        }),
      ],
    }),

    BullBoardModule.forFeature({
      name: ANALYTICS_QUEUE,
      adapter: BullMQAdapter,
    }),

    BullModule.registerQueue({
      name: ANALYTICS_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),
  ],
  providers: [AnalyticsProcessor],
  exports: [BullModule],
})
export class QueueModule {}
