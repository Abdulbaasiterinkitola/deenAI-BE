import { MigrationInterface, QueryRunner } from 'typeorm';

export class Streaks1764260414011 implements MigrationInterface {
  name = 'Streaks1764260414011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS streaks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type VARCHAR(20) NOT NULL DEFAULT 'hadith',
        user_id UUID NOT NULL UNIQUE,
        current_streak INTEGER NOT NULL DEFAULT 0,
        highest_streak INTEGER NOT NULL DEFAULT 0,
        last_completed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_streaks_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_streaks_last_completed_at ON streaks(last_completed_at);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_streaks_current_streak ON streaks(current_streak);
    `);

    // Composite partial index for the cleanup query (only indexes rows that need checking)
    // This significantly improves performance by only indexing relevant rows
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_streaks_cleanup 
      ON streaks(last_completed_at) 
      WHERE current_streak > 0 AND last_completed_at IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS streaks;`);
  }
}
