-- AlterTable
ALTER TABLE "users" ADD COLUMN     "event_registration_notifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scouting_window_notifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transfer_window_notifications" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "notification_types" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "notification_types_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "notifications" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_uuid" UUID NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_date" TIMESTAMPTZ(6),
    "type_uuid" UUID NOT NULL,
    "event" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_type_uuid_fkey" FOREIGN KEY ("type_uuid") REFERENCES "notification_types"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
