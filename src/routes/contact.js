import { Router } from 'express';
import { email } from '../modules/email';
import settings from '../config';

export default function contactRoute() {
  const router = new Router();

  router.post('/form', (req, res) => {
    email(settings.postmark.secretaryEmail, 'contactForm', req.body, req.body.email, settings.postmark.adminEmail);
    res.status(200).end();
  });

  router.post('/volunteer', (req, res) => {
    email(settings.postmark.volunteerEmail, 'volunteerForm', req.body, req.body.email, settings.postmark.adminEmail);
    res.status(200).end();
  });

  return router;
}
