-- DropForeignKey
ALTER TABLE "scopes" DROP CONSTRAINT "scopes_user_uuid_fkey";

-- AddForeignKey
ALTER TABLE "scopes" ADD CONSTRAINT "scopes_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "clubs.slug_unique" RENAME TO "clubs_slug_key";

-- RenameIndex
ALTER INDEX "users.email_unique" RENAME TO "users_email_key";
