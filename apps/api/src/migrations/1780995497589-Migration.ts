import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1780995497589 implements MigrationInterface {
  name = 'Migration1780995497589';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "usage_daily" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "type" character varying NOT NULL, "requestCount" integer NOT NULL DEFAULT '0', "userId" uuid, CONSTRAINT "UQ_6da027341d306e42911a97e59fc" UNIQUE ("userId", "date", "type"), CONSTRAINT "PK_b0d404396506036eee9af200809" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6da027341d306e42911a97e59f" ON "usage_daily" ("userId", "date", "type") `,
    );
    await queryRunner.query(
      `CREATE TABLE "generation_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "provider" character varying NOT NULL, "model" character varying NOT NULL, "inputTokens" integer, "outputTokens" integer, "platform" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_9733cabd3fd7ff75e217f0f28e5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying, "githubId" character varying, "githubUsername" character varying, "tier" character varying NOT NULL DEFAULT 'free', "preferredProvider" character varying NOT NULL DEFAULT 'google', "encryptedApiKey" character varying, "apiKeyIv" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_42148de213279d66bf94b363bf2" UNIQUE ("githubId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_daily" ADD CONSTRAINT "FK_2968e3b6340ee6da99d74b7e38b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "generation_history" ADD CONSTRAINT "FK_8aaf0de74aae6b3449dd95766d0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "generation_history" DROP CONSTRAINT "FK_8aaf0de74aae6b3449dd95766d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usage_daily" DROP CONSTRAINT "FK_2968e3b6340ee6da99d74b7e38b"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "generation_history"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6da027341d306e42911a97e59f"`,
    );
    await queryRunner.query(`DROP TABLE "usage_daily"`);
  }
}
