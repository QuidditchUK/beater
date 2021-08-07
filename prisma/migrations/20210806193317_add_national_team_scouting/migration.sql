-- AlterTable
ALTER TABLE "users" ADD COLUMN     "experience" TEXT,
ADD COLUMN     "first_team" VARCHAR(10),
ADD COLUMN     "national_team_interest" BOOLEAN,
ADD COLUMN     "playstyle" TEXT,
ADD COLUMN     "position" VARCHAR(20),
ADD COLUMN     "second_team" VARCHAR(10),
ADD COLUMN     "third_team" VARCHAR(10),
ADD COLUMN     "years" INTEGER;
