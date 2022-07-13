-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('CLUB', 'MERC', 'NATIONAL');

-- CreateTable
CREATE TABLE "teams" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMPTZ(6),
    "updated" TIMESTAMPTZ(6),
    "name" VARCHAR(255),
    "type" "TeamType" NOT NULL DEFAULT E'CLUB',
    "club_uuid" UUID,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "teams_users" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMPTZ(6),
    "updated" TIMESTAMPTZ(6),
    "team_uuid" UUID NOT NULL,
    "user_uuid" UUID NOT NULL,

    CONSTRAINT "teams_users_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_club_uuid_fkey" FOREIGN KEY ("club_uuid") REFERENCES "clubs"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_users" ADD CONSTRAINT "teams_users_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_users" ADD CONSTRAINT "teams_users_team_uuid_fkey" FOREIGN KEY ("team_uuid") REFERENCES "teams"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
