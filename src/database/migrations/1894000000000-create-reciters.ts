import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateReciters1894000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // For Postgres - create uuid extension if missing (no-op for other DBs)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.createTable(
      new Table({
        name: 'reciters',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: `uuid_generate_v4()`,
          },
          { name: 'reciter_name', type: 'varchar', isNullable: false },
          { name: 'surah', type: 'varchar', isNullable: false },
          { name: 'start_ayah', type: 'integer', isNullable: false },
          { name: 'end_ayah', type: 'integer', isNullable: false },
          { name: 'file_path', type: 'varchar', isNullable: false },
          { name: 'file_size', type: 'bigint', isNullable: false, default: 0 },
          { name: 'duration', type: 'integer', isNullable: true },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'reciters',
      new TableIndex({ name: 'IDX_RECITERS_RECITER_NAME', columnNames: ['reciter_name'] }),
    );
    await queryRunner.createIndex(
      'reciters',
      new TableIndex({ name: 'IDX_RECITERS_SURAH', columnNames: ['surah'] }),
    );
    await queryRunner.createIndex(
      'reciters',
      new TableIndex({ name: 'IDX_RECITERS_START_AYAH', columnNames: ['start_ayah'] }),
    );
    await queryRunner.createIndex(
      'reciters',
      new TableIndex({ name: 'IDX_RECITERS_END_AYAH', columnNames: ['end_ayah'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('reciters', 'IDX_RECITERS_END_AYAH');
    await queryRunner.dropIndex('reciters', 'IDX_RECITERS_START_AYAH');
    await queryRunner.dropIndex('reciters', 'IDX_RECITERS_SURAH');
    await queryRunner.dropIndex('reciters', 'IDX_RECITERS_RECITER_NAME');
    await queryRunner.dropTable('reciters');
  }
}
