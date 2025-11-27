import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimezoneToUsers1732742400000 implements MigrationInterface {
  name = 'AddTimezoneToUsers1732742400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS timezone`);
  }
}
