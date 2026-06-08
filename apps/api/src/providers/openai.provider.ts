import { Injectable } from '@nestjs/common';
import { createOpenAI } from '@ai-sdk/openai';
import { AIProvider, AIModel } from './provider.interface';

@Injectable()
export class OpenAIProvider implements AIProvider {
  readonly name = 'openai' as const;
  readonly modelId = 'gpt-4o-mini';

  getModel(apiKey?: string): AIModel {
    const openai = createOpenAI({
      apiKey: apiKey ?? process.env.OPENAI_API_KEY,
    });
    return openai(this.modelId);
  }
}
