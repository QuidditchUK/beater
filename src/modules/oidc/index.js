import { Provider } from 'oidc-provider';
import RedisAdapter from './adapter';
import Account from './account';
import settings from '../../config';
import jwks from './jwks.json';

const configuration = {
  clients: [
    {
      client_name: 'Quidditch Scheduler',
      logo_uri: 'https://www.quidditchscheduler.com/assets/site-icons/icon.svg',
      client_id: settings.oidc.quidditchSchedulerId,
      client_secret: settings.oidc.quidditchSchedulerSecret,
      redirect_uris: ['https://quidditchscheduler-staging.eu.auth0.com/login/callback', 'https://quidditchscheduler-develop.eu.auth0.com/login/callback', 'https://quidditchscheduler.eu.auth0.com/login/callback'],
      response_types: ['code'],
      grant_types: ['authorization_code'],
      token_endpoint_auth_method: 'client_secret_post',
    },
  ],
  formats: {
    AccessToken: 'jwt',
  },
  adapter: RedisAdapter,
  cookies: {
    keys: settings.oidc.cookiesKeys,
  },
  features: {
    devInteractions: { enabled: false },
    // encryption: { enabled: true },
    introspection: { enabled: true },
    revocation: { enabled: true },
  },
  jwks,

  // oidc-provider only looks up the accounts by their ID when it has to read the claims,
  // passing it our Account model method is sufficient, it should return a Promise that resolves
  // with an object with accountId property and a claims method.
  findAccount: Account.findAccount,

  // let's tell oidc-provider you also support the email scope, which will contain email and
  // email_verified claims
  claims: {
    openid: ['sub'],
    email: ['email'],
    profile: ['name', 'family_name', 'profile'],
  },

  // let's tell oidc-provider where our own interactions will be
  // setting a nested route is just good practice so that users
  // don't run into weird issues with multiple interactions open
  // at a time.
  interactions: {
    url(ctx) {
      return `/interaction/${ctx.oidc.uid}`;
    },
  },
};

const oidc = new Provider('https://quk-beater.herokuapp.com', configuration);

oidc.proxy = true;

// oidc.on('server_error', (_, error) => {
//   console.log(error);
// });

export default oidc;
