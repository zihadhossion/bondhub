import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthAndCommunityColumns1743523200001 implements MigrationInterface {
  name = 'AddAuthAndCommunityColumns1743523200001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "refresh_token_hash" character varying(255),
        ADD COLUMN IF NOT EXISTS "reset_password_token" character varying(255),
        ADD COLUMN IF NOT EXISTS "reset_password_expires" TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE "categories"
        ADD COLUMN IF NOT EXISTS "description" text
    `);

    await queryRunner.query(`
      ALTER TABLE "communities"
        ADD COLUMN IF NOT EXISTS "cover_image" character varying(255),
        ADD COLUMN IF NOT EXISTS "created_by_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "communities"
        ADD CONSTRAINT "FK_communities_created_by"
        FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
        ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "communities"
        DROP CONSTRAINT IF EXISTS "FK_communities_created_by"
    `);
    await queryRunner.query(`
      ALTER TABLE "communities"
        DROP COLUMN IF EXISTS "cover_image",
        DROP COLUMN IF EXISTS "created_by_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "categories"
        DROP COLUMN IF EXISTS "description"
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "refresh_token_hash",
        DROP COLUMN IF EXISTS "reset_password_token",
        DROP COLUMN IF EXISTS "reset_password_expires"
    `);
  }
}
