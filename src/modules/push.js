import * as push from 'web-push';
import prisma from './prisma';
import settings from '../config';

const client = push;

client.setVapidDetails('https://quidditchuk.org/about/contact', settings?.vapid?.publicKey, settings?.vapid?.privateKey);

const pushNotification = async (subscription, payload, uuid) => {
  try {
    client.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    // if sendNotification fails, remove the subscription
    prisma.push_notifications.delete({
      where: { uuid },
    });
  }
};

export default pushNotification;
