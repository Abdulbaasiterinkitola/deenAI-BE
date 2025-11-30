import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNewsletterSubscriptionsTable1736000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        email VARCHAR(255) NOT NULL,
        is_subscribed BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_newsletter_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email 
      ON newsletter_subscriptions(email);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_newsletter_user 
      ON newsletter_subscriptions(user_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed 
      ON newsletter_subscriptions(is_subscribed);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_newsletter_subscribed`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_newsletter_user`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_newsletter_email`);
    await queryRunner.query(`DROP TABLE IF EXISTS newsletter_subscriptions`);
  }
}
