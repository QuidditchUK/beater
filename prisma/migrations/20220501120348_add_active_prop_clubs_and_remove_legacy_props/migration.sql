/*
  Warnings:

  - You are about to drop the column `leader` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `leader_position` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `official_website` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `social_facebook` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `social_instagram` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `social_twitter` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `social_youtube` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `clubs` table. All the data in the column will be lost.
  - You are about to drop the column `trainings` on the `clubs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clubs" DROP COLUMN "leader",
DROP COLUMN "leader_position",
DROP COLUMN "official_website",
DROP COLUMN "social_facebook",
DROP COLUMN "social_instagram",
DROP COLUMN "social_twitter",
DROP COLUMN "social_youtube",
DROP COLUMN "tags",
DROP COLUMN "trainings",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
