import pushNotification from './push';
import { NOTIFICATION_PAYLOADS, PUSH_PAYLOADS } from '../constants/notifications';
import prisma from './prisma';

const sendNotifications = async ({ user_uuid, type_id }, data) => {
  const notificationPayload = NOTIFICATION_PAYLOADS[type_id] || null;

  await prisma?.notifications.create({
    data: {
      user_uuid,
      type_id,
      message: notificationPayload ? notificationPayload(data) : null,
    },
  });

  const pushNotifications = await prisma?.push_notifications?.findMany({
    where: { user_uuid },
  });

  if (!pushNotifications.length) {
    return;
  }

  const payloadLookup = PUSH_PAYLOADS[type_id];
  let payload = {};

  if (typeof payload === 'function') {
    payload = payloadLookup(data);
  } else {
    payload = payloadLookup;
  }

  pushNotifications?.forEach(({ endpoint, p256dh, auth }) => {
    pushNotification({ endpoint, keys: { p256dh, auth } }, PUSH_PAYLOADS[type_id]);
  });
};

export default sendNotifications;
