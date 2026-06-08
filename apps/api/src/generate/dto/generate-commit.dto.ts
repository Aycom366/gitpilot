import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { ProviderName } from '@gitpilot/shared-types';

export class GenerateCommitDto {
  @IsString()
  @MaxLength(8000) // diff can be large but we cap it
  diff: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsIn(['google', 'anthropic', 'openai'])
  provider?: ProviderName;
}
