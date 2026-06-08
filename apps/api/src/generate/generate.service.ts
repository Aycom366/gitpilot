import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { generateObject } from 'ai';
import { User } from '../database/models/user.entity';
import { GoogleProvider } from '../providers/google.provider';
import { AnthropicProvider } from '../providers/anthropic.provider';
import { OpenAIProvider } from '../providers/openai.provider';
import { AIProvider } from '../providers/provider.interface';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { UsersService } from '../users/users.service';
import { RateLimitExceededException } from '../common/exceptions/rate-limit.exception';
import { ANALYTICS_QUEUE, AnalyticsJobs } from 'src/utils/constant';
import { GenerationType, ProviderName } from '@gitpilot/shared-types';
import { GenerateCommitDto } from './dto/generate-commit.dto';
import { GeneratePrDto } from './dto/generate-pr.dto';
import { GenerateBranchDto } from './dto/generate-branch.dto';
import { CommitSchema, PrSchema, BranchSchema } from './schemas';

@Injectable()
export class GenerateService {
  /**
   * Map of provider name to provider instance.
   * e.g. { google: GoogleProvider, anthropic: AnthropicProvider, openai: OpenAIProvider }
   *
   */
  private readonly providerMap: Record<ProviderName, AIProvider>;

  constructor(
    private readonly google: GoogleProvider,
    private readonly anthropic: AnthropicProvider,
    private readonly openai: OpenAIProvider,
    private readonly rateLimitService: RateLimitService,
    private readonly usersService: UsersService,
    @InjectQueue(ANALYTICS_QUEUE) private readonly analyticsQueue: Queue,
  ) {
    this.providerMap = {
      google: this.google,
      anthropic: this.anthropic,
      openai: this.openai,
    };
  }

  async generateCommit(user: User, dto: GenerateCommitDto) {
    await this.checkLimit(user, 'commit');

    const { providerName, model, modelId } = this.resolveProvider(
      user,
      dto.provider,
    );
    const { object, usage } = await generateObject({
      model,
      schema: CommitSchema,
      system:
        'You are an expert at writing concise git commit messages following the Conventional Commits spec.',
      prompt: `Write a commit message for these changes:\n\n${dto.diff}${
        dto.context ? `\n\nContext: ${dto.context}` : ''
      }`,
      maxTokens: 300,
    });

    void this.enqueue(AnalyticsJobs.LOG_GENERATION, {
      userId: user.id,
      type: 'commit',
      provider: providerName,
      model: modelId,
      inputTokens: usage.promptTokens,
      outputTokens: usage.completionTokens,
    });

    return {
      title: object.title,
      body: object.body ?? '',
      provider: providerName,
      model: modelId,
    };
  }

  async generatePr(user: User, dto: GeneratePrDto) {
    await this.checkLimit(user, 'pr');

    const { providerName, model, modelId } = this.resolveProvider(
      user,
      dto.provider,
    );
    const commitList = dto.commits.map((c, i) => `${i + 1}. ${c}`).join('\n');

    const { object, usage } = await generateObject({
      model,
      schema: PrSchema,
      system:
        'You are an expert at writing clear GitHub pull request descriptions in markdown.',
      prompt: `Branch: ${dto.branch} → ${dto.baseBranch}\n\nCommits:\n${commitList}${
        dto.diff ? `\n\nDiff:\n${dto.diff}` : ''
      }`,
      maxTokens: 800,
    });

    void this.enqueue(AnalyticsJobs.LOG_GENERATION, {
      userId: user.id,
      type: 'pr',
      provider: providerName,
      model: modelId,
      inputTokens: usage.promptTokens,
      outputTokens: usage.completionTokens,
    });

    return {
      title: object.title,
      description: object.description,
      provider: providerName,
      model: modelId,
    };
  }

  async generateBranch(user: User, dto: GenerateBranchDto) {
    await this.checkLimit(user, 'branch');

    const { providerName, model, modelId } = this.resolveProvider(
      user,
      dto.provider,
    );

    const { object, usage } = await generateObject({
      model,
      schema: BranchSchema,
      system:
        'You generate git branch name slugs: lowercase, hyphens only, max 50 chars.',
      prompt: `Ticket: ${dto.ticketTitle}${dto.ticketId ? `\nID: ${dto.ticketId}` : ''}`,
      maxTokens: 50,
    });

    const branch = dto.ticketId
      ? `${dto.ticketId.toLowerCase()}/${object.branch}`
      : object.branch;

    void this.enqueue(AnalyticsJobs.LOG_GENERATION, {
      userId: user.id,
      type: 'branch',
      provider: providerName,
      model: modelId,
      inputTokens: usage.promptTokens,
      outputTokens: usage.completionTokens,
    });

    return { branch, provider: providerName, model: modelId };
  }

  async getUsage(user: User) {
    return {
      tier: user.tier,
      limit: 20,
      today: await this.rateLimitService.getUsageToday(user.id),
    };
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Resolves the provider name, configured model instance, and model ID.
   */
  private resolveProvider(user: User, preferred?: ProviderName) {
    const providerName: ProviderName =
      preferred ?? user.preferredProvider ?? 'google';
    const provider = this.providerMap[providerName];
    const apiKey =
      user.tier === 'byok'
        ? (this.usersService.decryptApiKey(user) ?? undefined)
        : undefined;

    return {
      providerName,
      model: provider.getModel(apiKey),
      modelId: provider.modelId,
    };
  }

  private async checkLimit(user: User, type: GenerationType): Promise<void> {
    if (user.tier === 'byok') return;
    const allowed = await this.rateLimitService.checkAndIncrement(
      user.id,
      type,
    );
    if (!allowed) {
      throw new RateLimitExceededException(
        `Daily limit of 20 ${type} generations reached. Resets at midnight UTC.`,
      );
    }
  }

  private enqueue(jobName: string, data: object): void {
    void this.analyticsQueue.add(jobName, data);
  }
}
