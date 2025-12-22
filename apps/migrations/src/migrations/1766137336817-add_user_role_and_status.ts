import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoleAndStatus1766137336817 implements MigrationInterface {
  name = 'AddUserRoleAndStatus1766137336817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('0', '1', '2')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('0', '1', '2')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "status" "public"."users_status_enum" NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
