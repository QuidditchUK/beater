import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import stripe from '../modules/stripe';
import settings from '../config';
import { authenticateJWT } from '../modules/jwt';
import { getUserProducts } from '../models/products';
import { checkAuthenticated } from '../modules/passport';

export default function productsRoute() {
  const router = new Router();

  router.get('/', authenticateJWT, checkAuthenticated, asyncHandler(async (_, res) => {
    const { data: products } = await stripe.products.list({ active: true });
    const { data: prices } = await stripe.prices.list();

    const results = products.map((prod) => {
      const price = prices.find(({ product }) => product === prod.id);
      return { ...prod, price };
    }).sort((a, b) => a.price.unit_amount - b.price.unit_amount);

    res.json(results);
  }));

  router.get('/session', authenticateJWT, asyncHandler(async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: req.query.price_id,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${settings.app.baseUrl}/dashboard/membership/success`,
      cancel_url: `${settings.app.baseUrl}/dashboard/membership/purchase`,
      metadata: {
        user_uuid: req.user.uuid,
      },
    });

    res.json(session);
  }));

  router.get('/me', authenticateJWT, checkAuthenticated, asyncHandler(async (req, res) => {
    const products = await getUserProducts(req.user.uuid);

    res.json(products);
  }));

  return router;
}
