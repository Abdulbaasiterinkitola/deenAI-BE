import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Logger } from '@nestjs/common';
import { join } from 'path';

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const dbType = (process.env.DB_TYPE as 'postgres' | 'sqlite') || 'postgres';

// Detect whether running TypeScript (dev) or JS (prod)
const isTs = __filename.endsWith('.ts');
const fileExt = isTs ? 'ts' : 'js';

// Paths to entities: include both `models` and `entities`
const entitiesPaths = [
  join(__dirname, '../modules/**/models/*.' + fileExt),
  join(__dirname, '../modules/**/entities/*.' + fileExt),
];

// Path to migrations
const migrationsPath = join(__dirname, '../database/migrations/*.' + fileExt);

const dataSourceConfig: any = {
  type: dbType,
  entities: entitiesPaths,
  migrations: [migrationsPath],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  migrationsTableName: 'migrations',
};

// DB connection config
if (dbType === 'sqlite') {
  dataSourceConfig.database = process.env.DB_NAME;
} else {
  dataSourceConfig.username = process.env.DB_USERNAME;
  dataSourceConfig.password = process.env.DB_PASSWORD;
  dataSourceConfig.host = process.env.DB_HOST;
  dataSourceConfig.port = Number(process.env.DB_PORT);
  dataSourceConfig.database = process.env.DB_NAME;
  dataSourceConfig.ssl = process.env.DB_SSL === 'true';
}

// Export data source for CLI
const dataSource = new DataSource(dataSourceConfig as DataSourceOptions);

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
