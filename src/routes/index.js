import express from 'express';
import methodOverride from 'method-override';
import authRoute from './auth';

const router = express.Router();

router.use(methodOverride('X-HTTP-Method-Override'));

router.use('/users', authRoute());

export default router;
