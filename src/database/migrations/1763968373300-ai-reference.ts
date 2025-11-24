import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiReference1763968373300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE IF EXISTS chat_messages
            ADD COLUMN IF NOT EXISTS reference varchar,
            ADD COLUMN IF NOT EXISTS reference_link varchar;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
         ALTER TABLE IF EXISTS chat_messages
            DROP COLUMN IF EXISTS reference,
            DROP COLUMN IF EXISTS reference_link;
    `);
  }
}
