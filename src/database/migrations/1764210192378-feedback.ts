import { MigrationInterface, QueryRunner } from 'typeorm';

export class Feedback1764210192378 implements MigrationInterface {
  name = 'Feedback1764210192378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS feedbacks;`);
  }
}
