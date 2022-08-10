import pushNotification from './push';
import { PUSH_PAYLOADS } from '../constants/notifications';
import prisma from './prisma';

const sendNotifications = async ({ user_uuid, type_id }) => {
  await prisma?.notifications.create({
    data: { user_uuid, type_id },
  });

  const pushNotifications = await prisma?.push_notifications?.findMany({
    where: { user_uuid },
  });

  if (!pushNotifications.length) {
    return;
  }

  pushNotifications?.forEach(({ endpoint, p256dh, auth }) => {
    pushNotification({ endpoint, keys: { p256dh, auth } }, PUSH_PAYLOADS[type_id]);
  });
};

export default sendNotifications;
