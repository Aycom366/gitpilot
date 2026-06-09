import { Injectable } from '@nestjs/common';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { AIProvider, AIModel } from './provider.interface';

@Injectable()
export class GoogleProvider implements AIProvider {
  readonly name = 'google' as const;
  readonly modelId = 'gemini-2.5-flash-lite';

  getModel(apiKey?: string): AIModel {
    const google = createGoogleGenerativeAI({
      apiKey: apiKey ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    return google(this.modelId);
  }
}
