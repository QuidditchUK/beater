import { Router } from 'express';
import { format } from 'date-fns';
import prisma from '../modules/prisma';
import stripe from '../modules/stripe';
import { update } from '../models/users';
import { create } from '../models/products';
import { Client } from '../modules/prismic';
import pushNotification from '../modules/push';
// import { PUSH_PAYLOADS } from '../constants/notifications';

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

        // prisma.stripe_products.upsert({
        //   where: {
        //     stripe_product_id: item?.price?.product,
        //   },
        //   create: {
        //     stripe_product_id: item?.price?.product,
        //     description: item?.description,
        //     expires: item?.price?.metadata?.expires,
        //   },
        //   update: {
        //     expires: item?.price?.metadata?.expires,
        //     description: item?.description,
        //   },
        // });

        res.status(200).end();
        break;
      }
      default:
        res.status(400).end();
    }
  });

  router.post('/prismic', async (req, res) => {
    try {
      const { documents, masterRef } = req.body;
      if (!documents[0]) {
        res.status(200).end();
        return;
      }

      const document = await Client(masterRef).getByID(documents[0]);

      // console.log(document);

      // push on events and news, first time published
      if (!document
        || (document?.type !== 'post' && document?.type !== 'events')
        || document?.first_publication_date !== document?.last_publication_date
      ) {
        res.status(200).end();
        return;
      }

      const payload = {
        post: {
          title: `News | ${document?.data?.title}`,
          body: document?.data?.meta_description || null,
          image: document?.data?.meta_image?.url || document?.data?.image?.url,
          data: { url: `/news/${document.uid}` },
        },
        events: {
          title: `Event | ${document?.data?.event_name}`,
          body: `${format(new Date(document?.data?.event_start_date), 'MMMM d, yyyy')} ${document?.data?.about}`,
          image: document?.data?.images?.[0]?.url || null,
          data: { url: `/events/${document.uid}` },
        },
      };

      // console.log(payload[document?.type]);
      // console.log(JSON.stringify(payload[document.type]));

      // send push notifications to those with push notifications
      const pushes = await prisma?.push_notifications?.findMany();

      // console.log('PUSHING NOTIFICATIONS:');
      // console.log(pushes.length);

      pushes?.forEach(({ endpoint, auth, p256dh }) => {
        pushNotification({ endpoint, keys: { auth, p256dh } }, payload[document.type]);
      });

      res.status(200).end();
    } catch (error) {
      console.log(error);
      res.status(200).end();
    }
  });

  return router;
}
