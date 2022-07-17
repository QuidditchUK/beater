-- CreateEnum
CREATE TYPE "ScoutingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ScoutingOutcome" AS ENUM ('PENDING', 'SUCCEEDED', 'UNSUCCESSFUL');

-- CreateTable
CREATE TABLE "scouting_requests" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "user_uuid" UUID NOT NULL,
    "status" "ScoutingStatus" NOT NULL DEFAULT E'PENDING',
    "reason" TEXT,
    "event" TEXT,
    "number" INTEGER,
    "team" TEXT,
    "pronouns" TEXT,
    "scouted_by" UUID,
    "outcome" "ScoutingOutcome" DEFAULT E'PENDING',

    CONSTRAINT "scouting_requests_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "scouting_requests" ADD CONSTRAINT "scouting_requests_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scouting_requests" ADD CONSTRAINT "scouting_requests_scouted_by_fkey" FOREIGN KEY ("scouted_by") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
