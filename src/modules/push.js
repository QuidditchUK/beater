import * as push from 'web-push';
import settings from '../config';

const client = push;

client.setVapidDetails('https://quidditchuk.org/about/contact', settings?.vapid?.publicKey, settings?.vapid?.privateKey);

const pushNotification = (subscription, payload) => client.sendNotification(subscription, JSON.stringify(payload));

export default pushNotification;
