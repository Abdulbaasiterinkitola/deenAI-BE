import { MigrationInterface, QueryRunner } from "typeorm";

export class Waitlist1763342011753 implements MigrationInterface {
    name = 'Waitlist1763342011753'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "waitlist" ADD CONSTRAINT "UQ_2221cffeeb64bff14201bd5b3de" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "waitlist" DROP CONSTRAINT "UQ_2221cffeeb64bff14201bd5b3de"`);
    }

}
