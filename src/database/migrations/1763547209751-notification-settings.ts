import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationSettings1763547209751 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notification_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        prayer_reminder BOOLEAN DEFAULT true,
        reflection_reminder BOOLEAN DEFAULT true,
        ai_alerts BOOLEAN DEFAULT true,
        CONSTRAINT uq_notification_settings_user UNIQUE (user_id),
        CONSTRAINT fk_notification_settings_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notification_settings`);
  }
}
