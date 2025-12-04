import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenUsageCreatedAtIndex1765001234567
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_token_usage_created_at 
      ON token_usage (created_at);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_token_usage_user_created_at 
      ON token_usage (user_id, created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_token_usage_user_created_at;`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_token_usage_created_at;`);
  }
}
