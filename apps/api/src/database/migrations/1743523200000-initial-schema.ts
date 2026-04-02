import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1743523200000 implements MigrationInterface {
  name = 'InitialSchema1743523200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE "role_enum" AS ENUM ('user', 'admin')
    `);
    await queryRunner.query(`
      CREATE TYPE "user_status_enum" AS ENUM ('active', 'suspended')
    `);
    await queryRunner.query(`
      CREATE TYPE "community_status_enum" AS ENUM ('active', 'archived')
    `);
    await queryRunner.query(`
      CREATE TYPE "content_type_enum" AS ENUM ('post', 'comment')
    `);
    await queryRunner.query(`
      CREATE TYPE "flag_status_enum" AS ENUM ('pending', 'resolved', 'dismissed')
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(255) NOT NULL,
        "password" character varying(255) NOT NULL,
        "display_name" character varying(100) NOT NULL,
        "bio" text,
        "profile_picture" character varying(255),
        "role" "role_enum" NOT NULL DEFAULT 'user',
        "status" "user_status_enum" NOT NULL DEFAULT 'active',
        "last_login_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name")
      )
    `);

    // Create communities table
    await queryRunner.query(`
      CREATE TABLE "communities" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "category_id" uuid NOT NULL,
        "status" "community_status_enum" NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_communities" PRIMARY KEY ("id"),
        CONSTRAINT "FK_communities_category" FOREIGN KEY ("category_id")
          REFERENCES "categories"("id") ON DELETE RESTRICT
      )
    `);

    // Create community_members table
    await queryRunner.query(`
      CREATE TABLE "community_members" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "community_id" uuid NOT NULL,
        "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_community_members" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_community_members_user_community" UNIQUE ("user_id", "community_id"),
        CONSTRAINT "FK_community_members_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_community_members_community" FOREIGN KEY ("community_id")
          REFERENCES "communities"("id") ON DELETE CASCADE
      )
    `);

    // Create posts table
    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(100) NOT NULL,
        "content" character varying(300) NOT NULL,
        "author_id" uuid NOT NULL,
        "community_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_posts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_posts_author" FOREIGN KEY ("author_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_posts_community" FOREIGN KEY ("community_id")
          REFERENCES "communities"("id") ON DELETE CASCADE
      )
    `);

    // Create comments table
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "content" text NOT NULL,
        "author_id" uuid NOT NULL,
        "post_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_author" FOREIGN KEY ("author_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_post" FOREIGN KEY ("post_id")
          REFERENCES "posts"("id") ON DELETE CASCADE
      )
    `);

    // Create follows table
    await queryRunner.query(`
      CREATE TABLE "follows" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "follower_id" uuid NOT NULL,
        "following_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_follows" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_follows_pair" UNIQUE ("follower_id", "following_id"),
        CONSTRAINT "CHK_follows_no_self_follow" CHECK ("follower_id" <> "following_id"),
        CONSTRAINT "FK_follows_follower" FOREIGN KEY ("follower_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_follows_following" FOREIGN KEY ("following_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create flags table (polymorphic — no DB-level FK on content_id)
    await queryRunner.query(`
      CREATE TABLE "flags" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "content_type" "content_type_enum" NOT NULL,
        "content_id" uuid NOT NULL,
        "flagged_by_id" uuid NOT NULL,
        "status" "flag_status_enum" NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_flags" PRIMARY KEY ("id"),
        CONSTRAINT "FK_flags_flagged_by" FOREIGN KEY ("flagged_by_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Indexes
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "users" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_communities_category_id" ON "communities" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_communities_status" ON "communities" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_community_members_user_id" ON "community_members" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_community_members_community_id" ON "community_members" ("community_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_posts_author_id" ON "posts" ("author_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_posts_community_id" ON "posts" ("community_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_posts_created_at" ON "posts" ("created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_comments_post_id" ON "comments" ("post_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_comments_author_id" ON "comments" ("author_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_follows_follower_id" ON "follows" ("follower_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_follows_following_id" ON "follows" ("following_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_flags_content" ON "flags" ("content_type", "content_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_flags_flagged_by_id" ON "flags" ("flagged_by_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_flags_status" ON "flags" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_flags_status"`);
    await queryRunner.query(`DROP INDEX "IDX_flags_flagged_by_id"`);
    await queryRunner.query(`DROP INDEX "IDX_flags_content"`);
    await queryRunner.query(`DROP INDEX "IDX_follows_following_id"`);
    await queryRunner.query(`DROP INDEX "IDX_follows_follower_id"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_author_id"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_post_id"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_community_id"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_author_id"`);
    await queryRunner.query(`DROP INDEX "IDX_community_members_community_id"`);
    await queryRunner.query(`DROP INDEX "IDX_community_members_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_communities_status"`);
    await queryRunner.query(`DROP INDEX "IDX_communities_category_id"`);
    await queryRunner.query(`DROP INDEX "IDX_users_status"`);
    await queryRunner.query(`DROP INDEX "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Drop tables (reverse dependency order)
    await queryRunner.query(`DROP TABLE "flags"`);
    await queryRunner.query(`DROP TABLE "follows"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "community_members"`);
    await queryRunner.query(`DROP TABLE "communities"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "flag_status_enum"`);
    await queryRunner.query(`DROP TYPE "content_type_enum"`);
    await queryRunner.query(`DROP TYPE "community_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
    await queryRunner.query(`DROP TYPE "role_enum"`);
  }
}
