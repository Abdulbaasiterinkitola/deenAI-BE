import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHadithReflectionSupport2001000000001
  implements MigrationInterface
{
  name = 'AddHadithReflectionSupport2001000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE reflections
      ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'quran',
      ADD COLUMN collection_id VARCHAR(255),
      ADD COLUMN hadith_number INT,
      ADD COLUMN book_number INT
    `);

    await queryRunner.query(`
      ALTER TABLE reflections
      ALTER COLUMN surah DROP NOT NULL,
      ALTER COLUMN start_ayah DROP NOT NULL,
      ALTER COLUMN end_ayah DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE reflections
      ALTER COLUMN surah SET NOT NULL,
      ALTER COLUMN start_ayah SET NOT NULL,
      ALTER COLUMN end_ayah SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE reflections
      DROP COLUMN book_number,
      DROP COLUMN hadith_number,
      DROP COLUMN collection_id,
      DROP COLUMN type
    `);
  }
}
