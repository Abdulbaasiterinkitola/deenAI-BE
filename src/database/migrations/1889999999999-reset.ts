import { MigrationInterface, QueryRunner } from 'typeorm';

export class PasswordResetOtp1889999999999 implements MigrationInterface {
  name = 'PasswordResetOtp1889999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS password_reset_otp (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        is_verified BOOLEAN NOT NULL DEFAULT false,
        used_at TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS password_reset_otp`);
  }
}
