import { db, pgp } from '../modules/pg';
import { sqlReadMany } from '../sql';
import stripe from '../modules/stripe';

export const create = (data) => db.none(pgp.helpers.insert(data, null, 'users_stripe_products'));
export const getUserProducts = async (user_uuid) => {
  const rows = await db.any(sqlReadMany, {
    columns: '*',
    table: 'users_stripe_products',
    key: 'user_uuid',
    value: user_uuid,
  });

  if (!rows.length) {
    return [];
  }

  const results = await Promise.all(rows.map(({ stripe_product_id }) => stripe.products.retrieve(stripe_product_id)));

  return results;
};
