import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentTransactions1895000000000
  implements MigrationInterface
{
  name = 'CreatePaymentTransactions1895000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create Enums
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_transactions_platform_enum') THEN
          CREATE TYPE "payment_transactions_platform_enum" AS ENUM('google', 'apple');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_transactions_status_enum') THEN
          CREATE TYPE "payment_transactions_status_enum" AS ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled');
        END IF;
      END $$;
    `);

    // Create Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        plan_id UUID NOT NULL,
        platform "payment_transactions_platform_enum" NOT NULL,
        transaction_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        original_transaction_id VARCHAR(255),
        purchase_date TIMESTAMP NOT NULL,
        expiration_date TIMESTAMP,
        status "payment_transactions_status_enum" NOT NULL DEFAULT 'pending',
        is_trial_period BOOLEAN NOT NULL DEFAULT FALSE,
        is_introductory_price_period BOOLEAN NOT NULL DEFAULT FALSE,
        raw_response JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        
        CONSTRAINT uq_payment_transaction_id UNIQUE (transaction_id),
        CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
        CONSTRAINT fk_payment_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
      );
    `);

    // Create Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payment_user_id ON payment_transactions(user_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payment_plan_id ON payment_transactions(plan_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_transactions(status);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS payment_transactions`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "payment_transactions_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "payment_transactions_platform_enum"`,
    );
  }
}

