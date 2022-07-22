/*
  Warnings:

  - The primary key for the `notification_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `notification_types` table. All the data in the column will be lost.
  - You are about to drop the column `type_uuid` on the `notifications` table. All the data in the column will be lost.
  - Added the required column `type_id` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_type_uuid_fkey";

-- DropIndex
DROP INDEX "notification_types_type_key";

-- AlterTable
ALTER TABLE "notification_types" DROP CONSTRAINT "notification_types_pkey",
DROP COLUMN "uuid",
ADD CONSTRAINT "notification_types_pkey" PRIMARY KEY ("type");

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "type_uuid",
ADD COLUMN     "type_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "notification_types"("type") ON DELETE RESTRICT ON UPDATE CASCADE;
