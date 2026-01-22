import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeDefaultBilliardTableStatus1769038040380
  implements MigrationInterface
{
  name = 'ChangeDefaultBilliardTableStatus1769038040380';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billiard_tables" ALTER COLUMN "status" SET DEFAULT 'Maintenance'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billiard_tables" ALTER COLUMN "status" SET DEFAULT 'Available'`,
    );
  }
}
