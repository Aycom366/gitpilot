import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import type { GenerationType } from '@gitpilot/shared-types';

@Entity('usage_daily')
@Unique(['user', 'date', 'type'])
@Index(['user', 'date', 'type'])
export class UsageDaily {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.usageDaily, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'date' })
  date: string; // 'YYYY-MM-DD'

  @Column({ type: 'varchar' })
  type: GenerationType;

  @Column({ default: 0 })
  requestCount: number;
}
