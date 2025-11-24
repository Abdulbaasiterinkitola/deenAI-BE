import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorAiReferences2000000000000 implements MigrationInterface {
  name = 'RefactorAiReferences2000000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE IF EXISTS chat_messages
        ADD COLUMN IF NOT EXISTS ai_references JSONB DEFAULT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS chat_messages
        DROP COLUMN IF EXISTS reference_link;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE IF EXISTS chat_messages
        ADD COLUMN IF NOT EXISTS reference_link VARCHAR DEFAULT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS chat_messages
        DROP COLUMN IF EXISTS ai_references;
    `);
  }
}
