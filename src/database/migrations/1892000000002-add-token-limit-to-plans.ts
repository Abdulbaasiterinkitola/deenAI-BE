import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenLimitToPlans1892000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" ADD "token_limit" integer`);
    await queryRunner.query(
<<<<<<< HEAD
      `UPDATE "plans" SET "token_limit" = 5000 WHERE "slug" = 'free'`,
=======
      `UPDATE "plans" SET "token_limit" = 100000 WHERE "slug" = 'free'`,
>>>>>>> bdd8e0abb6597d70561957c3f211d9703287440d
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "token_limit"`);
  }
}
