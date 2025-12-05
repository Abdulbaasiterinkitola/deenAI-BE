import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAthkarEnabledToNotificationSettings1764258683863
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification_settings"
      ADD COLUMN "athkar_notifications_enabled" BOOLEAN NOT NULL DEFAULT true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification_settings"
      DROP COLUMN "athkar_notifications_enabled";
    `);
  }
}
