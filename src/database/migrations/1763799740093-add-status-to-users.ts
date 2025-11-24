import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToUsers1763799740093 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the user_status enum type if it doesn't already exist
    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_status_enum') THEN
          CREATE TYPE "users_status_enum" AS ENUM('active', 'paused');
        END IF;
      END $$;`,
    );

    // Add the status column to the users table if it doesn't exist
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" "users_status_enum" NOT NULL DEFAULT 'active'`,
    );

    // Create an index on the status column if it doesn't exist
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_USERS_STATUS" ON "users" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USERS_STATUS"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "status"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "users_status_enum"`);
  }
}
