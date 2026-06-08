import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { UsageDaily } from './models/usage-daily.entity';
import { GenerationHistory } from './models/generation-history.entity';

const ENTITIES = [User, UsageDaily, GenerationHistory];

@Global() // repositories available in any module without re-importing
@Module({
  imports: [TypeOrmModule.forFeature(ENTITIES)],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
