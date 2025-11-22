import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanToUsers1892000000001 implements MigrationInterface {
  name = 'AddPlanToUsers1892000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id uuid NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD CONSTRAINT fk_users_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_plan`,
    );
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS plan_id`);
  }
}
