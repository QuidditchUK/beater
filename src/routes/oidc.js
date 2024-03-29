import { Router } from 'express';
import bodyParser from 'body-parser';
import oidc from '../modules/oidc';
import Account from '../modules/oidc/account';
import getLogger from '../modules/logger';
import { sanitiseEmailMiddleware } from '../modules/sanitise';

const log = getLogger('OIDC');

function setNoCache(req, res, next) {
  res.set('Pragma', 'no-cache');
  res.set('Cache-Control', 'no-cache, no-store');
  next();
}

const parse = bodyParser.urlencoded({ extended: false });

export default function oidcRoute() {
  const router = new Router();

  router.get('/:uid', setNoCache, async (req, res, next) => {
    try {
      const details = await oidc.interactionDetails(req, res);
      const { uid, prompt, params } = details;

      const client = await oidc.Client.find(params.client_id);

      if (prompt.name === 'login') {
        return res.render('login', {
          client,
          uid,
          details: prompt.details,
          params,
          title: 'Sign in to QuidditchUK',
          flash: undefined,
        });
      }

      return res.render('interaction', {
        client,
        uid,
        details: prompt.details,
        params,
        title: 'Authorise',
      });
    } catch (err) {
      log.error(err);
      return next(err);
    }
  });

  router.post('/:uid/login', sanitiseEmailMiddleware, setNoCache, parse, async (req, res, next) => {
    try {
      const { uid, prompt, params } = await oidc.interactionDetails(req, res);
      const client = await oidc.Client.find(params.client_id);

      const accountId = await Account.authenticate(req.body.email, req.body.password);

      if (!accountId) {
        res.render('login', {
          client,
          uid,
          details: prompt.details,
          params: {
            ...params,
            login_hint: req.body.email,
          },
          title: 'Sign in to QuidditchUK',
          flash: 'Invalid email or password.',
        });
        return;
      }

      const result = {
        login: {
          account: accountId,
        },
      };

      await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err) {
      log.error(err);
      next(err);
    }
  });

  router.post('/:uid/confirm', setNoCache, parse, async (req, res, next) => {
    try {
      const result = {
        consent: {
          // rejectedScopes: [], // < uncomment and add rejections here
          // rejectedClaims: [], // < uncomment and add rejections here
        },
      };
      await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
    } catch (err) {
      log.error(err);
      next(err);
    }
  });

  router.get('/:uid/abort', setNoCache, async (req, res, next) => {
    try {
      const result = {
        error: 'access_denied',
        error_description: 'End-User aborted interaction',
      };
      await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err) {
      log.error(err);
      next(err);
    }
  });

  return router;
}
