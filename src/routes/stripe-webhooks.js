import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import stripe from '../modules/stripe';
import { update } from '../models/users';
import { create } from '../models/products';
import settings from '../config';
import getLogger from '../modules/logger';

const logger = getLogger('routes/stripe-webhooks');

export default function stripeWebhooksRoute() {
  const router = new Router();

  router.post('/', asyncHandler(async (req, res) => {
    logger.info('----WEBHOOK ROUTE');

    const sig = req.headers['stripe-signature'];
    logger.info('----SIG:');
    logger.info(sig);
    logger.info('----WEBHOOK_TOKEN:');
    logger.info(settings.stripe.webhookToken);
    logger.info('----REQ BODY:');
    logger.info(req.body);

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, settings.stripe.webhookToken);
    } catch (err) {
      res.end();
    }

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
  }));
  return router;
}
