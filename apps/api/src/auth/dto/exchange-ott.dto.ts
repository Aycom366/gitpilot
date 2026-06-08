import { IsNotEmpty, IsString } from 'class-validator';

export class ExchangeOttDto {
  @IsString()
  @IsNotEmpty()
  ott: string;
}
