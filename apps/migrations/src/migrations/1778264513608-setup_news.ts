import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetupNews1778264513608 implements MigrationInterface {
  name = 'SetupNews1778264513608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."news_status_enum" AS ENUM('Draft', 'Review', 'Published')`,
    );
    await queryRunner.query(
      `CREATE TABLE "news" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "summary" text NOT NULL, "content" jsonb NOT NULL, "searchText" text NOT NULL DEFAULT '', "status" "public"."news_status_enum" NOT NULL DEFAULT 'Draft', "tags" text array NOT NULL DEFAULT '{}', "coverImageFilename" character varying, "authorId" uuid NOT NULL, "publishedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "news_status_idx" ON "news" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "news_published_at_idx" ON "news" ("publishedAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."news_published_at_idx"`);
    await queryRunner.query(`DROP INDEX "public"."news_status_idx"`);
    await queryRunner.query(`DROP TABLE "news"`);
    await queryRunner.query(`DROP TYPE "public"."news_status_enum"`);
  }
}
