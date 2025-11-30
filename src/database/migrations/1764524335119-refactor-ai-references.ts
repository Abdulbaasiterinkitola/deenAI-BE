import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorAiReferences1764524335119 implements MigrationInterface {
  name = 'RefactorAiReferences1764524335119';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ai_references ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50) DEFAULT 'quran';
    `);

    await queryRunner.query(`
      ALTER TABLE ai_references ADD COLUMN IF NOT EXISTS hadith_book VARCHAR(100) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE ai_references ADD COLUMN IF NOT EXISTS hadith_number VARCHAR(50) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ai_references DROP COLUMN IF EXISTS reference_type`);
    await queryRunner.query(`ALTER TABLE ai_references DROP COLUMN IF EXISTS hadith_book`);
    await queryRunner.query(`ALTER TABLE ai_references DROP COLUMN IF EXISTS hadith_number`);
  }
}
