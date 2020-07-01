import express from 'express';
import methodOverride from 'method-override';
import authRoute from './auth';
import clubsRoute from './clubs';
import eventsRoute from './events';
import searchRoute from './search';

const router = express.Router();

router.use(methodOverride('X-HTTP-Method-Override'));

router.use('/users', authRoute());
router.use('/clubs', clubsRoute());
router.use('/events', eventsRoute());
router.use('/search', searchRoute());

export default router;
