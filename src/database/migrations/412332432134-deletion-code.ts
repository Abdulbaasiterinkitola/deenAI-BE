import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeletionCode412332432134 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
        CREATE TABE IF NOT EXISTS deletion_codes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            code varchar(4) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            is_used BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP NOT NULLDEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),    
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
