import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResetOtpIdToUuid1764524319071 implements MigrationInterface {
  name = 'ResetOtpIdToUuid1764524319071';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      ALTER TABLE password_reset_otp DROP COLUMN IF EXISTS id;
    `);

    await queryRunner.query(`
      ALTER TABLE password_reset_otp ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE password_reset_otp DROP COLUMN IF EXISTS id;
    `);

    await queryRunner.query(`
      ALTER TABLE password_reset_otp ADD COLUMN id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY;
    `);
  }
}
