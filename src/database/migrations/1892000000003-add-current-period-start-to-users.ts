import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrentPeriodStartToUsers1892000000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add billing_start column to users table
    // This tracks when the user's current billing cycle began
    // Default to NOW() so existing users have a valid start date
    await queryRunner.query(
      `ALTER TABLE "users" ADD "billing_start" TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "billing_start"`);
  }
}
