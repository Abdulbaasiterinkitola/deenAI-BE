import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTokenUsageColumns1764600000000 implements MigrationInterface {
  name = 'FixTokenUsageColumns1764600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing columns that don't match the model
    await queryRunner.query(`ALTER TABLE token_usage DROP COLUMN IF EXISTS tokens_used`);
    await queryRunner.query(`ALTER TABLE token_usage DROP COLUMN IF EXISTS period_start`);
    await queryRunner.query(`ALTER TABLE token_usage DROP COLUMN IF EXISTS period_end`);

    // Add the correct columns as expected by the model
    await queryRunner.query(`ALTER TABLE token_usage ADD COLUMN IF NOT EXISTS input_tokens INT NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE token_usage ADD COLUMN IF NOT EXISTS output_tokens INT NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE token_usage ADD COLUMN IF NOT EXISTS total_tokens INT NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to original structure
    await queryRunner.query(`ALTER TABLE token_usage DROP COLUMN IF EXISTS input_tokens`);
    await queryRunner.query(`ALTER TABLE token_usage DROP COLUMN IF EXISTS output_tokens`);
    await queryRunner.query(`ALTER TABLE token_usage DROP COLUMN IF EXISTS total_tokens`);
    
    await queryRunner.query(`ALTER TABLE token_usage ADD COLUMN IF NOT EXISTS tokens_used INT NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE token_usage ADD COLUMN IF NOT EXISTS period_start TIMESTAMP NOT NULL DEFAULT NOW()`);
    await queryRunner.query(`ALTER TABLE token_usage ADD COLUMN IF NOT EXISTS period_end TIMESTAMP NOT NULL DEFAULT NOW()`);
  }
}