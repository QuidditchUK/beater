import stripe from 'stripe';
import settings from '../config';

const client = stripe(settings.stripe.token);

export default client;
