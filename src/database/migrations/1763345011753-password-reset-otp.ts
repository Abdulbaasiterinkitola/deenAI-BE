// src/database/migrations/PasswordResetOtp1763345011753.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class PasswordResetOtp1763345011753 implements MigrationInterface {
  name = 'PasswordResetOtp1763345011753';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `);

    await queryRunner.query(`
    DROP TABLE IF EXISTS password_reset_otp CASCADE;
  `);

    await queryRunner.query(`
    CREATE TABLE password_reset_otp (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      used_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

    await queryRunner.query(`
    CREATE INDEX idx_password_reset_otp_email 
    ON password_reset_otp (email);
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS password_reset_otp`);
  }
}
