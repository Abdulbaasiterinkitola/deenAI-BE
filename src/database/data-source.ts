import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const dataSource = new DataSource({
  type: (process.env.DB_TYPE as 'postgres') || 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  database: process.env.DB_NAME,
  entities: [process.env.DB_ENTITIES!],
  migrations: [process.env.DB_MIGRATIONS!],
  namingStrategy: new SnakeNamingStrategy(), // Converts camelCase to snake_case
  synchronize: false, // Always false in production - use migrations
  migrationsTableName: 'migrations',
  ssl: process.env.DB_SSL === 'true',
});

export async function initializeDataSource() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

export default dataSource;

