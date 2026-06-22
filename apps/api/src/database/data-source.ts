import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * Used by the TypeORM CLI for migrations.
 * Run: pnpm migration:run
 * Generate: pnpm migration:generate -- -n MigrationName
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/models/*.entity.{ts,js}'],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  synchronize: false, // never — always use migrations
});
