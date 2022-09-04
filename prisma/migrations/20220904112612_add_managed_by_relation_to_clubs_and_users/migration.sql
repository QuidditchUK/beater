-- AlterTable
ALTER TABLE "clubs" ADD COLUMN     "managed_by" UUID;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_managed_by_fkey" FOREIGN KEY ("managed_by") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
