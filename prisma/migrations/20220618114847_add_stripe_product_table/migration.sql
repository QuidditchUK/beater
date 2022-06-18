-- CreateTable
CREATE TABLE "stripe_products" (
    "uuid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripe_product_id" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "expires" VARCHAR(255) NOT NULL,

    CONSTRAINT "stripe_products_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_products_stripe_product_id_key" ON "stripe_products"("stripe_product_id");

-- AddForeignKey
ALTER TABLE "users_stripe_products" ADD CONSTRAINT "users_stripe_products_stripe_product_id_fkey" FOREIGN KEY ("stripe_product_id") REFERENCES "stripe_products"("stripe_product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
