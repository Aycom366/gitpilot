import { IsIn, IsOptional, IsString } from 'class-validator';
import type { ProviderName } from '@gitpilot/shared-types';

export class UpdateProviderDto {
  @IsIn(['google', 'anthropic', 'openai'])
  provider: ProviderName;

  @IsOptional()
  @IsString()
  apiKey?: string; // if provided, saves as BYOK key and sets tier to 'byok'
}
