import { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreaseOtpLength1763676450310 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "deletion_codes"
            ALTER COLUMN "code" TYPE VARCHAR(6)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "deletion_codes"
            ALTER COLUMN "code" TYPE VARCHAR(6)
        `);
  }
}
