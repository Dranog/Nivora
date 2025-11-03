-- AlterTable users: Add username column and rename password to passwordHash
ALTER TABLE "users" ADD COLUMN "username" TEXT;
ALTER TABLE "users" RENAME COLUMN "password" TO "passwordHash";

-- Generate unique usernames for existing users (email prefix)
UPDATE "users" SET "username" = LOWER(SPLIT_PART("email", '@', 1)) || '_' || SUBSTR(MD5(RANDOM()::text), 1, 6);

-- Make username required and unique
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
