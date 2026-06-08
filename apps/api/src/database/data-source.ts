import { DataSource } from 'typeorm';

/**
 * Used by the TypeORM CLI for migrations.
 * Run: pnpm migration:run
 * Generate: pnpm migration:generate -- -n MigrationName
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/database/models/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false, // never — always use migrations
});
