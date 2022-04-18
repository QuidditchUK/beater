-- CreateTable
CREATE TABLE "scopes" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "scope" VARCHAR(255) NOT NULL,
    "user_uuid" UUID NOT NULL,

    PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "scopes.scope_unique" ON "scopes"("scope");

-- AddForeignKey
ALTER TABLE "scopes" ADD FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
