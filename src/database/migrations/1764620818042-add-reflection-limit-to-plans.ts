import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReflectionLimitToPlans1764620818042 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "plans" ADD "reflection_limit" integer NOT NULL DEFAULT '10'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "reflection_limit"`);
    }
}
