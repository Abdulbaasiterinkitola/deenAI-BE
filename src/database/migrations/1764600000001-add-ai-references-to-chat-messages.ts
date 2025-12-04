import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiReferencesToChatMessages1764600000001
  implements MigrationInterface
{
  name = 'AddAiReferencesToChatMessages1764600000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add ai_references column to chat_messages table
    await queryRunner.query(
      `ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS ai_references JSONB DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages DROP COLUMN IF EXISTS ai_references`,
    );
  }
}
