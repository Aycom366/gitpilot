import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { RateLimitService } from './rate-limit.service';

@Module({
  imports: [QueueModule],
  providers: [RateLimitService],
  exports: [RateLimitService],
})
export class RateLimitModule {}
