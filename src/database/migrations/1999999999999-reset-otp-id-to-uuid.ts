import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertPasswordResetOtpIdToUuid1999999999999 implements MigrationInterface {
  name = 'ConvertPasswordResetOtpIdToUuid1999999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(`
      ALTER TABLE password_reset_otp
      ADD COLUMN _id_tmp UUID DEFAULT uuid_generate_v4();
    `);

    await queryRunner.query(`
      UPDATE password_reset_otp
      SET _id_tmp = uuid_generate_v4()
      WHERE _id_tmp IS NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE password_reset_otp
      DROP CONSTRAINT password_reset_otp_pkey;
    `);

    await queryRunner.query(`
      ALTER TABLE password_reset_otp
      DROP COLUMN id;
    `);

    await queryRunner.query(`
      ALTER TABLE password_reset_otp
      RENAME COLUMN _id_tmp TO id;
    `);

    await queryRunner.query(`
      ALTER TABLE password_reset_otp
      ADD PRIMARY KEY (id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE password_reset_otp
      DROP COLUMN id;
    `);
  }
}
