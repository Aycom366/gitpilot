import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { QueueModule } from '../queue/queue.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { UsersModule } from '../users/users.module';
import { GenerateController } from './generate.controller';
import { GenerateService } from './generate.service';

@Module({
  imports: [ProvidersModule, QueueModule, RateLimitModule, UsersModule],
  controllers: [GenerateController],
  providers: [GenerateService],
})
export class GenerateModule {}
