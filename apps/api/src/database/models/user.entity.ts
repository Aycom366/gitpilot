import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsageDaily } from './usage-daily.entity';
import { GenerationHistory } from './generation-history.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  @Exclude() // not exposed via API
  passwordHash: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  githubId: string | null;

  @Column({ type: 'varchar', nullable: true })
  githubUsername: string | null;

  @Column({ type: 'varchar', default: 'free' })
  tier: 'free' | 'byok';

  @Column({ type: 'varchar', default: 'google' })
  preferredProvider: 'google' | 'anthropic' | 'openai';

  @Column({ type: 'varchar', nullable: true })
  encryptedApiKey: string | null;

  @Exclude() // not exposed via API
  @Column({ type: 'varchar', nullable: true })
  apiKeyIv: string | null;

  @OneToMany(() => UsageDaily, (usage) => usage.user)
  usageDaily: UsageDaily[];

  @OneToMany(() => GenerationHistory, (history) => history.user)
  generationHistory: GenerationHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
