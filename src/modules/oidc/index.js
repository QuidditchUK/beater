import { Provider } from 'oidc-provider';
import RedisAdapter from './adapter';

import jwks from './jwks.json';

const configuration = {
  clients: [
    {
      client_id: 'foo',
      client_secret: 'bar',
      redirect_uris: ['http://lvh.me/cb'],
    },
  ],
  formats: {
    AccessToken: 'jwt',
  },
  adapter: RedisAdapter,
  cookies: {
    keys: ['super secure key', 'another', 'one more'],
  },
  features: {
    encryption: { enabled: true },
    introspection: { enabled: true },
    revocation: { enabled: true },
  },
  jwks,
};

const oidc = new Provider('http://localhost:3333', configuration);

oidc.proxy = true;

export default oidc;
