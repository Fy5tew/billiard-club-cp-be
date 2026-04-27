import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendBilliardTablesPhoto1776416532946
  implements MigrationInterface
{
  name = 'ExtendBilliardTablesPhoto1776416532946';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" DROP COLUMN "billiardTableId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" ADD "sortOrder" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" DROP CONSTRAINT "FK_ddf20b84936c933c8108eb615c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" ALTER COLUMN "billiard_table_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" ADD CONSTRAINT "FK_ddf20b84936c933c8108eb615c5" FOREIGN KEY ("billiard_table_id") REFERENCES "billiard_tables"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" DROP CONSTRAINT "FK_ddf20b84936c933c8108eb615c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" ALTER COLUMN "billiard_table_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" ADD CONSTRAINT "FK_ddf20b84936c933c8108eb615c5" FOREIGN KEY ("billiard_table_id") REFERENCES "billiard_tables"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" DROP COLUMN "sortOrder"`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" ADD "billiardTableId" character varying NOT NULL`,
    );
  }
}
