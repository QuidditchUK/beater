-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_actioned_by_fkey" FOREIGN KEY ("actioned_by") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
