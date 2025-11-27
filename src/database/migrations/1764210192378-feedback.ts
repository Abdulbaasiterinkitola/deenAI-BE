import { MigrationInterface, QueryRunner } from 'typeorm';

export class Feedback1764210192378 implements MigrationInterface {
  name = 'Feedback1764210192378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "feedbacks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "name" character varying(255) NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text NOT NULL,
        CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "name" character varying
    `);

    await queryRunner.query(`
      UPDATE "users"
      SET "name" = 'Anonymous'
      WHERE "name" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "name" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "feedbacks"`);
  }
}
