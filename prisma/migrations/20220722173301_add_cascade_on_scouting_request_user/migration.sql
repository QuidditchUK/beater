-- DropForeignKey
ALTER TABLE "scouting_requests" DROP CONSTRAINT "scouting_requests_user_uuid_fkey";

-- AddForeignKey
ALTER TABLE "scouting_requests" ADD CONSTRAINT "scouting_requests_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
