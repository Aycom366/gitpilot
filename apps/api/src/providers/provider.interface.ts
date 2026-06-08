import { generateObject } from 'ai';
import { ProviderName } from '@gitpilot/shared-types';

export type AIModel = Parameters<typeof generateObject>[0]['model'];

export interface AIProvider {
  readonly name: ProviderName;
  readonly modelId: string;
  /**
   * Returns a configured model instance.
   * apiKey is only passed for BYOK users — platform key used otherwise.
   */
  getModel(apiKey?: string): AIModel;
}
