import { MigrationInterface, QueryRunner } from 'typeorm';

export class BilliardTablesInit1766408198463 implements MigrationInterface {
  name = 'BilliardTablesInit1766408198463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "billiard_table_photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "billiardTableId" character varying NOT NULL, "photoFilename" character varying NOT NULL, "billiard_table_id" uuid, CONSTRAINT "PK_00992f96a4e179319f3989f6a95" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."billiard_tables_type_enum" AS ENUM('POOL', 'SNOOKER', 'RUSSIAN_BILLIARDS', 'CAROM', 'ENGLISH_BILLIARDS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."billiard_tables_status_enum" AS ENUM('Available', 'Blocked', 'Maintenance')`,
    );
    await queryRunner.query(
      `CREATE TABLE "billiard_tables" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "hourlyPrice" numeric NOT NULL, "type" "public"."billiard_tables_type_enum" NOT NULL, "status" "public"."billiard_tables_status_enum" NOT NULL DEFAULT 'Available', CONSTRAINT "PK_f46f8f88df6a86aa4dedaf5ca3f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" ADD CONSTRAINT "FK_ddf20b84936c933c8108eb615c5" FOREIGN KEY ("billiard_table_id") REFERENCES "billiard_tables"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "billiard_table_photos" DROP CONSTRAINT "FK_ddf20b84936c933c8108eb615c5"`,
    );
    await queryRunner.query(`DROP TABLE "billiard_tables"`);
    await queryRunner.query(`DROP TYPE "public"."billiard_tables_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."billiard_tables_type_enum"`);
    await queryRunner.query(`DROP TABLE "billiard_table_photos"`);
  }
}
