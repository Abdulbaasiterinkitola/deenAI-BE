import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStreaksForExistingUsers1764260414012 implements MigrationInterface {
  name = 'CreateStreaksForExistingUsers1764260414012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert streak records for all users that don't have one
    // This ensures all existing users have a streak entry
    await queryRunner.query(`
      INSERT INTO streaks (user_id, type, current_streak, highest_streak, last_completed_at, created_at, updated_at)
      SELECT 
        u.id,
        'hadith'::VARCHAR(20),
        0,
        0,
        NULL,
        NOW(),
        NOW()
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1 
        FROM streaks s 
        WHERE s.user_id = u.id
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM streaks
      WHERE current_streak = 0
        AND highest_streak = 0
        AND last_completed_at IS NULL
        AND type = 'hadith'
        AND created_at = updated_at
    `);
  }
}
