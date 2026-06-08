import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import type {
  GenerationType,
  Platform,
  ProviderName,
} from '@gitpilot/shared-types';

@Entity('generation_history')
export class GenerationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.generationHistory, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  type: GenerationType;

  @Column()
  provider: ProviderName;

  @Column()
  model: string;

  @Column({ nullable: true })
  inputTokens: number | null;

  @Column({ nullable: true })
  outputTokens: number | null;

  @Column({ nullable: true })
  platform: Platform | null;

  @CreateDateColumn()
  createdAt: Date;
}
