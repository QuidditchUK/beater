/*
  Warnings:

  - You are about to drop the column `description` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `featured_color` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `text_color` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `clubs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clubs" DROP COLUMN "description",
DROP COLUMN "featured_color",
DROP COLUMN "icon",
DROP COLUMN "images",
DROP COLUMN "status",
DROP COLUMN "text_color",
DROP COLUMN "venue";
