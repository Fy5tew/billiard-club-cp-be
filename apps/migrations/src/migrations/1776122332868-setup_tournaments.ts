import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetupTournaments1776122332868 implements MigrationInterface {
  name = 'SetupTournaments1776122332868';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tournaments_status_enum" AS ENUM('0', '1', '2', '3', '4', '5')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tournaments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "startAt" TIMESTAMP NOT NULL, "endAt" TIMESTAMP NOT NULL, "registrationDeadline" TIMESTAMP NOT NULL, "maxParticipants" integer NOT NULL, "entryFee" numeric(10,2) NOT NULL, "status" "public"."tournaments_status_enum" NOT NULL DEFAULT '0', "format" character varying, "rules" text, "prizeDescription" text, "publishedAt" TIMESTAMP, CONSTRAINT "PK_6d5d129da7a80cf99e8ad4833a9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3b1c8c0c3aaf5b1b3c49429ef9" ON "tournaments" ("startAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5bdbbbf95bc2bcb5caada90f0c" ON "tournaments" ("status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tournament_registrations_status_enum" AS ENUM('0', '1', '2', '3', '4', '5')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tournament_registrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tournamentId" uuid NOT NULL, "userId" uuid NOT NULL, "status" "public"."tournament_registrations_status_enum" NOT NULL DEFAULT '0', CONSTRAINT "PK_3354f23042eaec7b08ec3b61b81" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a0854dd5082187c75a7ce58468" ON "tournament_registrations" ("tournamentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c415e08c7384bc574a13ac318c" ON "tournament_registrations" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tournament_registrations" ADD CONSTRAINT "FK_a0854dd5082187c75a7ce584688" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tournament_registrations" DROP CONSTRAINT "FK_a0854dd5082187c75a7ce584688"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c415e08c7384bc574a13ac318c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a0854dd5082187c75a7ce58468"`,
    );
    await queryRunner.query(`DROP TABLE "tournament_registrations"`);
    await queryRunner.query(
      `DROP TYPE "public"."tournament_registrations_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5bdbbbf95bc2bcb5caada90f0c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3b1c8c0c3aaf5b1b3c49429ef9"`,
    );
    await queryRunner.query(`DROP TABLE "tournaments"`);
    await queryRunner.query(`DROP TYPE "public"."tournaments_status_enum"`);
  }
}
