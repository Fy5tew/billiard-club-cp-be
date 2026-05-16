import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTournamentBrackets1778799538183 implements MigrationInterface {
  name = 'AddTournamentBrackets1778799538183';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tournament_matches_status_enum" AS ENUM('Pending', 'Ready', 'Completed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tournament_matches_winreason_enum" AS ENUM('Normal', 'Bye', 'Technical')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tournament_matches_nextslot_enum" AS ENUM('A', 'B')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tournament_matches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tournamentId" uuid NOT NULL, "bracketId" uuid NOT NULL, "roundIndex" integer NOT NULL, "matchIndex" integer NOT NULL, "participantAUserId" uuid, "participantBUserId" uuid, "scoreA" integer, "scoreB" integer, "winnerUserId" uuid, "loserUserId" uuid, "status" "public"."tournament_matches_status_enum" NOT NULL DEFAULT 'Pending', "winReason" "public"."tournament_matches_winreason_enum", "nextMatchId" uuid, "nextSlot" "public"."tournament_matches_nextslot_enum", "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b128bcced13707fbc4ac1519216" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tournament_matches_participant_b_user_id" ON "tournament_matches" ("participantBUserId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tournament_matches_participant_a_user_id" ON "tournament_matches" ("participantAUserId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tournament_matches_winner_user_id" ON "tournament_matches" ("winnerUserId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_tournament_matches_bracket_round_match_unique" ON "tournament_matches" ("bracketId", "roundIndex", "matchIndex") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tournament_matches_bracket_id" ON "tournament_matches" ("bracketId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tournament_matches_tournament_id" ON "tournament_matches" ("tournamentId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tournament_brackets_status_enum" AS ENUM('Seeding', 'Active', 'Completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tournament_brackets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tournamentId" uuid NOT NULL, "size" integer NOT NULL, "status" "public"."tournament_brackets_status_enum" NOT NULL DEFAULT 'Seeding', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_db8fa84c55420d1795b93c17fc9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a3e04d0a84b15d641533178bbc" ON "tournament_brackets" ("status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_tournament_brackets_tournament_id_unique" ON "tournament_brackets" ("tournamentId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tournament_matches" ADD CONSTRAINT "FK_8b729ff23b080160ff0cc4a2b5f" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tournament_matches" ADD CONSTRAINT "FK_1957d5e92b1ef4ce9d555bf7aee" FOREIGN KEY ("bracketId") REFERENCES "tournament_brackets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tournament_matches" ADD CONSTRAINT "FK_7fb43ed7f2dcb1718d155495c09" FOREIGN KEY ("nextMatchId") REFERENCES "tournament_matches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tournament_brackets" ADD CONSTRAINT "FK_2f3dd7273d6baa3ac20fa0d484d" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tournament_brackets" DROP CONSTRAINT "FK_2f3dd7273d6baa3ac20fa0d484d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tournament_matches" DROP CONSTRAINT "FK_7fb43ed7f2dcb1718d155495c09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tournament_matches" DROP CONSTRAINT "FK_1957d5e92b1ef4ce9d555bf7aee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tournament_matches" DROP CONSTRAINT "FK_8b729ff23b080160ff0cc4a2b5f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tournament_brackets_tournament_id_unique"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3e04d0a84b15d641533178bbc"`,
    );
    await queryRunner.query(`DROP TABLE "tournament_brackets"`);
    await queryRunner.query(
      `DROP TYPE "public"."tournament_brackets_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tournament_matches_tournament_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tournament_matches_bracket_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tournament_matches_bracket_round_match_unique"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tournament_matches_winner_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tournament_matches_participant_a_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_tournament_matches_participant_b_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "tournament_matches"`);
    await queryRunner.query(
      `DROP TYPE "public"."tournament_matches_nextslot_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tournament_matches_winreason_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tournament_matches_status_enum"`,
    );
  }
}
