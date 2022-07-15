-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_club_uuid_fkey";

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_club_uuid_fkey" FOREIGN KEY ("club_uuid") REFERENCES "clubs"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
