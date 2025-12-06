import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductIdsToPlans1764913325000 implements MigrationInterface {
  name = 'AddProductIdsToPlans1764913325000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE plans ADD COLUMN IF NOT EXISTS google_product_id VARCHAR(255) NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE plans ADD COLUMN IF NOT EXISTS apple_product_id VARCHAR(255) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE plans DROP COLUMN IF EXISTS google_product_id`,
    );
    await queryRunner.query(
      `ALTER TABLE plans DROP COLUMN IF EXISTS apple_product_id`,
    );
  }
}
