import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlansTable1892000000000 implements MigrationInterface {
  name = 'CreatePlansTable1892000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        slug VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        description TEXT NULL,
        price NUMERIC(10,2) NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        interval VARCHAR(20) NOT NULL DEFAULT 'monthly',
        is_popular BOOLEAN NOT NULL DEFAULT FALSE,
        is_custom BOOLEAN NOT NULL DEFAULT FALSE,
        display_order INT NOT NULL DEFAULT 0,
        features TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS plans`);
  }
}
