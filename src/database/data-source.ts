import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Logger } from '@nestjs/common';

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const dbType = (process.env.DB_TYPE as 'postgres' | 'sqlite') || 'postgres';

const dataSourceConfig: any = {
  type: dbType,
  entities: [process.env.DB_ENTITIES!],
  migrations: [process.env.DB_MIGRATIONS!],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  migrationsTableName: 'migrations',
};

// SQLIte config
if (dbType === 'sqlite') {
  dataSourceConfig.database = process.env.DB_NAME;
} else {
  // Postgres config
  dataSourceConfig.username = process.env.DB_USERNAME;
  dataSourceConfig.password = process.env.DB_PASSWORD;
  dataSourceConfig.host = process.env.DB_HOST;
  dataSourceConfig.port = Number(process.env.DB_PORT!);
  dataSourceConfig.database = process.env.DB_NAME;
  dataSourceConfig.ssl = process.env.DB_SSL === 'true';
}

// IMPORTANT — MUST EXPORT THE DATA SOURCE DIRECTLY FOR CLI
const dataSource = new DataSource(dataSourceConfig);

// Optional helper (Nest uses)
export async function initializeDataSource() {
  const logger = new Logger('Database');

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
    try {
      const migrations = await dataSource.runMigrations();
      if (migrations.length > 0) {
        logger.log(`Ran ${migrations.length} migration(s)`);
      } else {
        logger.log('No pending migrations.');
      }
    } catch (error) {
      logger.error('Error running migrations:', error);
      throw error;
    }
  }

  return dataSource;
}

export default dataSource;
