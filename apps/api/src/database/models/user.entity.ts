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

  @Column({ nullable: true })
  @Exclude() // not exposed via API
  passwordHash: string | null;

  @Column({ unique: true, nullable: true })
  githubId: string | null;

  @Column({ nullable: true })
  githubUsername: string | null;

  @Column({ default: 'free' })
  tier: 'free' | 'byok';

  @Column({ default: 'google' })
  preferredProvider: 'google' | 'anthropic' | 'openai';

  @Column({ nullable: true })
  encryptedApiKey: string | null;

  @Exclude() // not exposed via API
  @Column({ nullable: true })
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
