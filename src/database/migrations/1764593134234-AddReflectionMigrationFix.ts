import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReflectionMigrationFix1764593134234 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE reflections ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'quran';
    `);

    await queryRunner.query(`
      ALTER TABLE reflections ADD COLUMN IF NOT EXISTS book_number INT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE reflections ADD COLUMN IF NOT EXISTS collection_id VARCHAR(255) NULL;
    `);

    // 3. Make Quran fields nullable
    await queryRunner.query(`
      ALTER TABLE reflections 
      ALTER COLUMN surah DROP NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE reflections 
      ALTER COLUMN start_ayah DROP NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE reflections 
      ALTER COLUMN end_ayah DROP NOT NULL;
    `);

    // 4. Remove incorrect earlier-added columns (if they exist)
    await queryRunner.query(`
      ALTER TABLE reflections DROP COLUMN IF EXISTS reflection_type;
    `);

    await queryRunner.query(`
      ALTER TABLE reflections DROP COLUMN IF EXISTS hadith_book;
    `);

    await queryRunner.query(`
      ALTER TABLE reflections ADD COLUMN IF NOT EXISTS collection_id VARCHAR(255) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse correct fields
    await queryRunner.query(
      `ALTER TABLE reflections DROP COLUMN IF EXISTS type`,
    );
    await queryRunner.query(
      `ALTER TABLE reflections DROP COLUMN IF EXISTS book_number`,
    );

    // Restore old (incorrect) fields in case you roll back
    await queryRunner.query(`
      ALTER TABLE reflections 
      ADD COLUMN IF NOT EXISTS reflection_type VARCHAR(50) DEFAULT 'quran';
    `);

    await queryRunner.query(`
      ALTER TABLE reflections 
      ADD COLUMN IF NOT EXISTS hadith_book VARCHAR(100) NULL;
    `);

    // Quran fields revert to NOT NULL (assuming original model)
    await queryRunner.query(`
      ALTER TABLE reflections 
      ALTER COLUMN surah SET NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE reflections 
      ALTER COLUMN start_ayah SET NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE reflections 
      ALTER COLUMN end_ayah SET NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE reflections DROP COLUMN IF EXISTS collection_id;
    `);
  }
}
