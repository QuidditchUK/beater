-- AddForeignKey
ALTER TABLE "users_stripe_products" ADD CONSTRAINT "users_stripe_products_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
