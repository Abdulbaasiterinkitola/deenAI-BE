import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenLimitToPlans1892000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" ADD "token_limit" integer`);
    await queryRunner.query(
      `UPDATE "plans" SET "token_limit" = 5000 WHERE "slug" = 'free'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "token_limit"`);
  }
}
