import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RedisService } from '../redis/redis.service';
import { GenerationType } from '@gitpilot/shared-types';
import {
  ANALYTICS_QUEUE,
  AnalyticsJobs,
  FREE_TIER_LIMIT,
} from 'src/utils/constant';

@Injectable()
export class RateLimitService {
  constructor(
    private readonly redis: RedisService,
    @InjectQueue(ANALYTICS_QUEUE) private readonly analyticsQueue: Queue,
  ) {}

  async checkAndIncrement(
    userId: string,
    type: GenerationType,
  ): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const key = `rl:${userId}:${today}:${type}`;

    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, this.secondsUntilMidnightUTC());
    }

    if (current > FREE_TIER_LIMIT) return false;

    void this.analyticsQueue.add(AnalyticsJobs.UPSERT_USAGE, {
      userId,
      date: today,
      type,
    });

    return true;
  }

  async getUsageToday(
    userId: string,
  ): Promise<Partial<Record<GenerationType, number>>> {
    const today = new Date().toISOString().split('T')[0];
    const types: GenerationType[] = [
      'commit',
      'pr',
      'branch',
      'review-summary',
      'release-notes',
      'changelog',
    ];
    const usage: Partial<Record<GenerationType, number>> = {};

    await Promise.all(
      types.map(async (type) => {
        const val = await this.redis.get(`rl:${userId}:${today}:${type}`);
        if (val) usage[type] = parseInt(val, 10);
      }),
    );

    return usage;
  }

  private secondsUntilMidnightUTC(): number {
    const now = new Date();
    const midnight = new Date();
    midnight.setUTCHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  }
}
