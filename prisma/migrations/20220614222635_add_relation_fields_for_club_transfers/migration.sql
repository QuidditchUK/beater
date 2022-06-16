-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_prev_club_uuid_fkey" FOREIGN KEY ("prev_club_uuid") REFERENCES "clubs"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_new_club_uuid_fkey" FOREIGN KEY ("new_club_uuid") REFERENCES "clubs"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
