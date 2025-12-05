import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCollectionsTable1764863403215 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Enums
    await queryRunner.query(
      `CREATE TYPE "public"."collection_type_enum" AS ENUM('hadith', 'duaa', 'athkar', 'quran', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."compression_algorithm_enum" AS ENUM('gzip', 'brotli', 'deflate', 'none')`,
    );

    // Create Table
    await queryRunner.query(`
      CREATE TABLE "collections" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "public"."collection_type_enum" NOT NULL DEFAULT 'other',
        "name" character varying NOT NULL,
        "description" character varying,
        "language" character varying NOT NULL,
        "version" character varying NOT NULL,
        "original_file_path" character varying NOT NULL,
        "compressed_file_path" character varying,
        "original_size" bigint NOT NULL,
        "compressed_size" bigint,
        "compression_ratio" double precision,
        "compression_algorithm" "public"."compression_algorithm_enum" NOT NULL DEFAULT 'none',
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_collections_id" PRIMARY KEY ("id")
      )
    `);

    // Create Unique Index
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_collections_type_lang_ver" ON "collections" ("type", "language", "version")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_collections_type_lang_ver"`,
    );
    await queryRunner.query(`DROP TABLE "collections"`);
    await queryRunner.query(`DROP TYPE "public"."compression_algorithm_enum"`);
    await queryRunner.query(`DROP TYPE "public"."collection_type_enum"`);
  }
}
