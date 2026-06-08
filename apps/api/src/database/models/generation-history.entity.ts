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

  @Column({ type: 'varchar' })
  type: GenerationType;

  @Column({ type: 'varchar' })
  provider: ProviderName;

  @Column({ type: 'varchar' })
  model: string;

  @Column({ type: 'int', nullable: true })
  inputTokens: number | null;

  @Column({ type: 'int', nullable: true })
  outputTokens: number | null;

  @Column({ type: 'varchar', nullable: true })
  platform: Platform | null;

  @CreateDateColumn()
  createdAt: Date;
}
