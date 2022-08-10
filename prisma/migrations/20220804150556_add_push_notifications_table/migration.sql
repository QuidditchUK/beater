-- CreateTable
CREATE TABLE "push_notifications" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT,
    "device_id" TEXT,
    "user_uuid" UUID NOT NULL,

    CONSTRAINT "push_notifications_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_notifications_endpoint_key" ON "push_notifications"("endpoint");

-- AddForeignKey
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
