import { Router } from 'express';
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

        res.status(200).end();
        break;
      }
      default:
        res.status(400).end();
    }
  });

  return router;
}
