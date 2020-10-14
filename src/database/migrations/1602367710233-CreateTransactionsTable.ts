import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTransactionsTable1602367710233 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(new Table({
      name: 'transactions',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()'
        },
        {
          name: 'title',
          type: 'varchar',
        },
        {
          name: 'type',
          type: 'enum',
          enum: ['income', 'outcome'],
          enumName: 'transactionType'
        },
        {
          name: 'value',
          type: 'numeric(10,2)'
        },
        {
          name: 'category_id',
          type: 'uuid'
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()'
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()'
        },
      ]
    }));

    await queryRunner.createForeignKey('transactions', new TableForeignKey({
      columnNames: ['category_id'],
      referencedTableName: 'categories',
      name: 'transaction_category_fk',
      referencedColumnNames: ['id'],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropForeignKey('transactions', 'transaction_category_fk');
    await queryRunner.dropTable('transactions');
  }

}
