import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { UsageDaily } from '../database/models/usage-daily.entity';
import { GenerationHistory } from '../database/models/generation-history.entity';
import { GenerationType, ProviderName } from '@gitpilot/shared-types';
import { ANALYTICS_QUEUE, AnalyticsJobs } from 'src/utils/constant';

export interface UpsertUsageJob {
  userId: string;
  date: string;
  type: GenerationType;
}

export interface LogGenerationJob {
  userId: string;
  type: GenerationType;
  provider: ProviderName;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

@Processor(ANALYTICS_QUEUE)
export class AnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(
    @InjectRepository(UsageDaily)
    private readonly usageRepo: Repository<UsageDaily>,
    @InjectRepository(GenerationHistory)
    private readonly historyRepo: Repository<GenerationHistory>,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case AnalyticsJobs.UPSERT_USAGE:
        await this.handleUpsertUsage(job.data as UpsertUsageJob);
        break;
      case AnalyticsJobs.LOG_GENERATION:
        await this.handleLogGeneration(job.data as LogGenerationJob);
        break;
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }

  private async handleUpsertUsage(data: UpsertUsageJob): Promise<void> {
    try {
      await this.usageRepo
        .createQueryBuilder()
        .insert()
        .into(UsageDaily)
        .values({
          user: { id: data.userId },
          date: data.date,
          type: data.type,
          requestCount: 1,
        })
        .orUpdate(['requestCount'], ['user', 'date', 'type'], {
          skipUpdateIfNoValuesChanged: false,
          upsertType: 'on-conflict-do-update',
        })
        .execute();
    } catch (err) {
      this.logger.error('Failed to upsert usage', err);
      throw err; // BullMQ will retry
    }
  }

  private async handleLogGeneration(data: LogGenerationJob): Promise<void> {
    try {
      await this.historyRepo.save({
        user: { id: data.userId },
        type: data.type,
        provider: data.provider,
        model: data.model,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
      });
    } catch (err) {
      this.logger.error('Failed to log generation', err);
      throw err;
    }
  }
}
