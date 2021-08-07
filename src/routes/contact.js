import { Router } from 'express';
import { email } from '../modules/email';
import settings from '../config';

export default function contactRoute() {
  const router = new Router();

  router.post('/form', (req, res) => {
    email(settings.postmark.secretaryEmail, 'contactForm', req.body, settings.postmark.adminEmail, settings.postmark.adminEmail);
    res.status(200).end();
  });

  router.post('/volunteer', (req, res) => {
    email(settings.postmark.volunteerEmail, 'volunteerForm', req.body, settings.postmark.adminEmail, settings.postmark.adminEmail);
    res.status(200).end();
  });

  router.post('/edi', (req, res) => {
    email(
      `${settings.postmark.presidentEmail}, ${settings.postmark.vicePresidentEmail}, ${settings.postmark.volunteerEmail}`,
      'ediCommitteeForm',
      req.body,
      settings.postmark.adminEmail,
    );
    res.status(200).end();
  });

  router.post('/youth-coach', (req, res) => {
    email(
      `${settings.postmark.presidentEmail}, ${settings.postmark.adminEmail}, ${settings.postmark.volunteerEmail}, ${settings.postmark.youthEmail}`,
      'youthCoachForm',
      req.body,
      settings.postmark.adminEmail,
    );
    res.status(200).end();
  });

  return router;
}
