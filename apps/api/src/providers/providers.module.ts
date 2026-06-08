import { Module } from '@nestjs/common';
import { GoogleProvider } from './google.provider';
import { AnthropicProvider } from './anthropic.provider';
import { OpenAIProvider } from './openai.provider';

@Module({
  providers: [GoogleProvider, AnthropicProvider, OpenAIProvider],
  exports: [GoogleProvider, AnthropicProvider, OpenAIProvider],
})
export class ProvidersModule {}
