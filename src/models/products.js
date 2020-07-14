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

  const sortedRows = rows.sort((a, b) => a.created - b.created);

  const products = await Promise.all(sortedRows.map(({ stripe_product_id }) => stripe.products.retrieve(stripe_product_id)));
  const { data: prices } = await stripe.prices.list();

  const results = products.map((prod) => {
    const price = prices.find(({ product }) => product === prod.id);
    return { ...prod, price };
  });

  return results;
};
