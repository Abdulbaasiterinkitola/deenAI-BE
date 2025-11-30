import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanToUsers1764524274752 implements MigrationInterface {
  name = 'AddPlanToUsers1764524274752';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id) ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS plan_id`);
  }
}
