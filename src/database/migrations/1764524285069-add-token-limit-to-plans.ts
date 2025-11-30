import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenLimitToPlans1764524285069 implements MigrationInterface {
  name = 'AddTokenLimitToPlans1764524285069';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE plans ADD COLUMN IF NOT EXISTS token_limit INT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE plans DROP COLUMN IF EXISTS token_limit`);
  }
}
