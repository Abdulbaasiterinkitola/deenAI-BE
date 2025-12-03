import { MigrationInterface, QueryRunner } from 'typeorm';

export class Superadmin1764788763247 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS
            is_superadmin BOOLEAN NOT NULL DEFAULT FALSE;
        `);

    // partial index for superadmin queries (only indexes rows where is_superadmin = true)
    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_users_is_superadmin 
            ON users(is_superadmin) 
            WHERE is_superadmin = true;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_users_is_superadmin;
        `);

    await queryRunner.query(`
            ALTER TABLE users DROP COLUMN IF EXISTS is_superadmin;
        `);
  }
}
