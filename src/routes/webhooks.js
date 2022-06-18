import { Router } from 'express';
import { prisma } from '@prisma/client';
import stripe from '../modules/stripe';
import { update } from '../models/users';
import { create } from '../models/products';

export default function stripeWebhooksRoute() {
  const router = new Router();

  router.post('/stripe', async (req, res) => {
    const event = req.body;

    switch (event.type) {
      case 'checkout.session.completed': {
        const { customer, metadata, id } = event.data.object;
        const { user_uuid } = metadata;

        const { data } = await stripe.checkout.sessions.listLineItems(id);
        const [item] = data;

        update(user_uuid, { stripe_customer_id: customer });
        create({ user_uuid, stripe_product_id: item.price.product });

        prisma.stripe_products.upsert({
          where: {
            stripe_product_id: item?.price?.product,
          },
          create: {
            stripe_product_id: item?.price?.product,
            description: item?.description,
            expires: item?.price?.metadata?.expires,
          },
          update: {
            expires: item?.price?.metadata?.expires,
            description: item?.description,
          },
        });

        res.status(200).end();
        break;
      }
      default:
        res.status(400).end();
    }
  });

  return router;
}
