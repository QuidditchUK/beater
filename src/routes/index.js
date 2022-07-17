import express from 'express';
import methodOverride from 'method-override';
import authRoute from './auth';
import clubsRoute from './clubs';
import productsRoute from './products';
import contactRoute from './contact';
import webhooksRoute from './webhooks';
import oidcRoute from './oidc';
import oidc from '../modules/oidc';
import scopesRoute from './scopes';
import transfersRoute from './transfers';
import scoutingRoute from './scouting';
import settingsRoute from './settings';

const router = express.Router();

router.use(methodOverride('X-HTTP-Method-Override'));

router.use('/users', authRoute());
router.use('/clubs', clubsRoute());
router.use('/products', productsRoute());
router.use('/contact', contactRoute());
router.use('/webhooks', webhooksRoute());
router.use('/scopes', scopesRoute());
router.use('/transfers', transfersRoute());
router.use('/scouting', scoutingRoute());
router.use('/settings', settingsRoute());
router.use('/interaction', oidcRoute());

router.use('/oidc', oidc.callback);

export default router;
