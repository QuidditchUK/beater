/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `notification_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "notification_types_type_key" ON "notification_types"("type");
