import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProductIdsToPlans1764913325000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'plans',
      new TableColumn({
        name: 'google_product_id',
        type: 'varchar',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'plans',
      new TableColumn({
        name: 'apple_product_id',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('plans', 'google_product_id');
    await queryRunner.dropColumn('plans', 'apple_product_id');
  }
}
