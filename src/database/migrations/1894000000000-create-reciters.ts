import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReciters1894000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create uuid extension if Postgres
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Create table with raw SQL so schema is explicit and consistent with other migrations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS reciters (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        reciter_name varchar NOT NULL,
        surah varchar NOT NULL,
        start_ayah integer NOT NULL,
        end_ayah integer NOT NULL,
        file_path varchar NOT NULL,
        file_size bigint NOT NULL DEFAULT 0,
        duration integer,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Indexes (raw SQL)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_reciters_reciter_name ON reciters(reciter_name);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_reciters_surah ON reciters(surah);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_reciters_start_ayah ON reciters(start_ayah);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_reciters_end_ayah ON reciters(end_ayah);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_reciters_end_ayah;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_reciters_start_ayah;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_reciters_surah;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_reciters_reciter_name;`);
    await queryRunner.query(`DROP TABLE IF EXISTS reciters;`);
  }
}
