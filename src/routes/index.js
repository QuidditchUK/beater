import express from 'express';
import methodOverride from 'method-override';
import authRoute from './auth';
import clubsRoute from './clubs';

const router = express.Router();

router.use(methodOverride('X-HTTP-Method-Override'));

router.use('/users', authRoute());
router.use('/clubs', clubsRoute());

export default router;
