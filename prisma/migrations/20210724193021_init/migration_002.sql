-- Add scouting columns to users table
ALTER TABLE "users"
    ADD "national_team_interest" BOOLEAN,
    ADD "first_team" VARCHAR(10),
    ADD "second_team" VARCHAR(10),
    ADD "third_team" VARCHAR(10),
    ADD "position" VARCHAR(10),
    ADD "playstyle" TEXT,
    ADD "years" INTEGER,
    ADD "experience" TEXT;
