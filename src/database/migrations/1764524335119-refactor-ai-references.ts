import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorAiReferences1764524335119 implements MigrationInterface {
  name = 'RefactorAiReferences1764524335119';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ai_references table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ai_references (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        chat_message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
        reference_type VARCHAR(50) DEFAULT 'quran',
        surah INT NULL,
        ayah INT NULL,
        hadith_book VARCHAR(100) NULL,
        hadith_number VARCHAR(50) NULL,
        reference_text TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_references_chat_message ON ai_references(chat_message_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ai_references`);
  }
}
