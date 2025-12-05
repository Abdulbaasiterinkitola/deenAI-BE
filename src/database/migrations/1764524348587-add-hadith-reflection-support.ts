import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHadithReflectionSupport1764524348587
  implements MigrationInterface
{
  name = 'AddHadithReflectionSupport1764524348587';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE reflections ADD COLUMN IF NOT EXISTS reflection_type VARCHAR(50) DEFAULT 'quran';
    `);

    await queryRunner.query(`
      ALTER TABLE reflections ADD COLUMN IF NOT EXISTS hadith_book VARCHAR(100) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE reflections ADD COLUMN IF NOT EXISTS hadith_number VARCHAR(50) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE reflections ALTER COLUMN surah DROP NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE reflections ALTER COLUMN start_ayah DROP NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE reflections ALTER COLUMN end_ayah DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE reflections DROP COLUMN IF EXISTS reflection_type`,
    );
    await queryRunner.query(
      `ALTER TABLE reflections DROP COLUMN IF EXISTS hadith_book`,
    );
    await queryRunner.query(
      `ALTER TABLE reflections DROP COLUMN IF EXISTS hadith_number`,
    );
  }
}
