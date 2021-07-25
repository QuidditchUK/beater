CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "clubs" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMPTZ(6),
    "updated" TIMESTAMPTZ(6),
    "name" VARCHAR(255),
    "slug" VARCHAR,
    "league" VARCHAR(255),
    "venue" VARCHAR NOT NULL,
    "featured_color" VARCHAR(30),
    "text_color" VARCHAR(30),
    "icon" VARCHAR(255) NOT NULL,
    "trainings" VARCHAR(255),
    "leader" VARCHAR(255),
    "leader_position" VARCHAR(255),
    "official_website" VARCHAR(255),
    "status" VARCHAR NOT NULL DEFAULT E'active',
    "social_facebook" VARCHAR(255),
    "social_twitter" VARCHAR(255),
    "social_youtube" VARCHAR(255),
    "social_instagram" VARCHAR(255),
    "tags" TEXT[],
    "images" TEXT[],
    "description" TEXT,
    "email" VARCHAR(255),

    PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "users" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(255) NOT NULL,
    "hashed_password" VARCHAR,
    "salt" VARCHAR,
    "type" VARCHAR NOT NULL DEFAULT E'user',
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "phone" VARCHAR(30),
    "last_login" TIMESTAMPTZ(6),
    "stripe_customer_id" VARCHAR(255),
    "club_uuid" UUID,
    "is_student" BOOLEAN,
    "university" TEXT,

    PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "users_stripe_products" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "user_uuid" UUID NOT NULL,
    "stripe_product_id" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "clubs.slug_unique" ON "clubs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users.email_unique" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD FOREIGN KEY ("club_uuid") REFERENCES "clubs"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- LowercaseEmails

CREATE OR REPLACE FUNCTION lowercase_email_on_insert() RETURNS TRIGGER AS $lowercase_email_on_insert$
    BEGIN        
        NEW.email = LOWER(NEW.email);
        RETURN NEW;
    END;
    $lowercase_email_on_insert$ LANGUAGE plpgsql;

CREATE TRIGGER lowercase_email_on_insert_trigger BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE lowercase_email_on_insert();