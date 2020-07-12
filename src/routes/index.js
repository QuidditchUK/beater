import express from 'express';
import methodOverride from 'method-override';
import authRoute from './auth';
import clubsRoute from './clubs';
import eventsRoute from './events';
import searchRoute from './search';
import productsRoute from './products';

const router = express.Router();

router.use(methodOverride('X-HTTP-Method-Override'));

router.use('/users', authRoute());
router.use('/clubs', clubsRoute());
router.use('/events', eventsRoute());
router.use('/search', searchRoute());
router.use('/products', productsRoute());

export default router;
