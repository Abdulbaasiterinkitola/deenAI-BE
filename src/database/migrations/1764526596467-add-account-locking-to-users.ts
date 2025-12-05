import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountLockingToUsers1764526596467
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add account locking columns to users table
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP NULL;
    `);

    // Create index for locked accounts (faster queries)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_account_locked 
      ON users(account_locked_until) 
      WHERE account_locked_until IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index first
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_users_account_locked;
    `);

    // Remove columns
    await queryRunner.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS failed_login_attempts,
      DROP COLUMN IF EXISTS account_locked_until,
      DROP COLUMN IF EXISTS last_failed_login;
    `);
  }
}
