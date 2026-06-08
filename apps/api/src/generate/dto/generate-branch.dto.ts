import { IsIn, IsOptional, IsString } from 'class-validator';
import type { ProviderName } from '@gitpilot/shared-types';

export class GenerateBranchDto {
  @IsString()
  ticketTitle: string;

  @IsOptional()
  @IsString()
  ticketId?: string; // e.g. "GP-42" — prepended to branch name if provided

  @IsOptional()
  @IsIn(['google', 'anthropic', 'openai'])
  provider?: ProviderName;
}
