import { MigrationInterface, QueryRunner } from 'typeorm';

export class Bookmarks1891000000000 implements MigrationInterface {
  name = 'Bookmarks1891000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        surah INT NOT NULL,
        ayah INT NOT NULL,
        translation TEXT,
        ayah_ar TEXT,
        translation_language VARCHAR(32),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_bookmarks_user_ayah UNIQUE (user_id, surah, ayah)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS bookmarks;`);
  }
}
