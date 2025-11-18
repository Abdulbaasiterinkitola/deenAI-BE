import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Logger } from '@nestjs/common';

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const dbType = process.env.DB_TYPE as 'postgres' | 'sqlite' || 'postgres';

const dataSourceConfig: any = {
  type: dbType,
  entities: [process.env.DB_ENTITIES!],
  migrations: [process.env.DB_MIGRATIONS!],
  namingStrategy: new SnakeNamingStrategy(), // Converts camelCase to snake_case
  synchronize: false, // Always false in production - use migrations
  migrationsTableName: 'migrations',
};

// Configure based on database type
if (dbType === 'sqlite') {
  dataSourceConfig.database = process.env.DB_NAME;
} else {
  // PostgreSQL configuration
  dataSourceConfig.username = process.env.DB_USERNAME;
  dataSourceConfig.password = process.env.DB_PASSWORD;
  dataSourceConfig.host = process.env.DB_HOST;
  dataSourceConfig.port = +process.env.DB_PORT!;
  dataSourceConfig.database = process.env.DB_NAME;
  dataSourceConfig.ssl = process.env.DB_SSL === 'true';
}

const dataSource = new DataSource(dataSourceConfig);

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
