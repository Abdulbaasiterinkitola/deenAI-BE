import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrentPeriodStartToUsers1764524295337 implements MigrationInterface {
  name = 'AddCurrentPeriodStartToUsers1764524295337';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS current_period_start`,
    );
  }
}
