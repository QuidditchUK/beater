import stripe from '../modules/stripe';
import prisma from '../modules/prisma';

export const create = async (data) => {
  await prisma.users_stripe_products.create({ data });
};
export const getUserProducts = async (user_uuid) => {
  const rows = await prisma.users_stripe_products.findMany({
    where: { user_uuid },
  });

  if (!rows.length) {
    return [];
  }

  const sortedRows = rows.sort((a, b) => b.created - a.created);

  const products = await Promise.all(sortedRows.map(({ stripe_product_id }) => stripe.products.retrieve(stripe_product_id)));
  const { data: prices } = await stripe.prices.list();

  const results = products.map((prod) => {
    const price = prices.find(({ product }) => product === prod.id);
    return { ...prod, price };
  });

  return results;
};
