import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Logger } from '@nestjs/common';

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
  const logger = new Logger('Database');

  if (!dataSource.isInitialized) {
    await dataSource.initialize();

    try {
      const migrations = await dataSource.runMigrations();
      if (migrations.length > 0) {
        logger.log(
          `Ran ${migrations.length} pending migration(s) successfully`,
        );
      } else {
        logger.log('No pending migrations to run');
      }
    } catch (error) {
      logger.error('Error running migrations:', error);
      throw error;
    }
  }
  return dataSource;
}

export default dataSource;
