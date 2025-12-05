import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingStartToUsers1764526596468 implements MigrationInterface {
  name = 'AddBillingStartToUsers1764526596468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_start TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS billing_start`,
    );
  }
}
