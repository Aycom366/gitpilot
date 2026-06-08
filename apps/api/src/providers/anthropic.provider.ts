import { Injectable } from '@nestjs/common';
import { createAnthropic } from '@ai-sdk/anthropic';
import { AIProvider, AIModel } from './provider.interface';

@Injectable()
export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic' as const;
  readonly modelId = 'claude-haiku-4-5-20251001';

  getModel(apiKey?: string): AIModel {
    const anthropic = createAnthropic({
      apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
    return anthropic(this.modelId);
  }
}
