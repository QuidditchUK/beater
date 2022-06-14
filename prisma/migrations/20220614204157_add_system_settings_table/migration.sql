-- CreateTable
CREATE TABLE "system_settings" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "transfer_window" BOOLEAN DEFAULT false,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("uuid")
);
