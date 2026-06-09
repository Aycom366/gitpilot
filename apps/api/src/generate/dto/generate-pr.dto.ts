import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { ProviderName } from '@gitpilot/shared-types';

export class GeneratePrDto {
  @IsArray()
  @IsString({ each: true })
  commits: string[];

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  diff?: string;

  @IsString()
  branch: string;

  @IsString()
  baseBranch: string;

  @IsOptional()
  @IsIn(['google', 'anthropic', 'openai'])
  provider?: ProviderName;
}
