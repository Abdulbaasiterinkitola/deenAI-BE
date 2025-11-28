import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to create the 'token_usage' table.
 * This table stores the history of AI token consumption per user.
 */
export class TokenUsage1893000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the token_usage table with columns for user_id, feature, model, and token counts.
    // Includes a foreign key constraint to the users table with ON DELETE CASCADE.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS token_usage (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        input_tokens INT NOT NULL DEFAULT 0,
        output_tokens INT NOT NULL DEFAULT 0,
        total_tokens INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the table if the migration is reverted.
    await queryRunner.query(`DROP TABLE IF EXISTS token_usage`);
  }
}
