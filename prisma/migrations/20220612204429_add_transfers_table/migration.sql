-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateTable
CREATE TABLE "transfers" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "user_uuid" UUID NOT NULL,
    "prev_club_uuid" UUID,
    "new_club_uuid" UUID,
    "status" "TransferStatus" NOT NULL DEFAULT E'PENDING',
    "actioned_by" UUID,
    "reason" TEXT,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
