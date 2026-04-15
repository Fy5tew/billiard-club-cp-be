import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTournamentRegistrationDate1776244416986
  implements MigrationInterface
{
  name = 'AddTournamentRegistrationDate1776244416986';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tournament_registrations" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tournament_registrations" DROP COLUMN "createdAt"`,
    );
  }
}
