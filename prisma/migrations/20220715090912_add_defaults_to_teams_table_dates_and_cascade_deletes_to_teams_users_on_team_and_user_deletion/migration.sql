-- DropForeignKey
ALTER TABLE "teams_users" DROP CONSTRAINT "teams_users_team_uuid_fkey";

-- DropForeignKey
ALTER TABLE "teams_users" DROP CONSTRAINT "teams_users_user_uuid_fkey";

-- AlterTable
ALTER TABLE "teams" ALTER COLUMN "created" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "teams_users" ADD CONSTRAINT "teams_users_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_users" ADD CONSTRAINT "teams_users_team_uuid_fkey" FOREIGN KEY ("team_uuid") REFERENCES "teams"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
