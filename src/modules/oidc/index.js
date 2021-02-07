import { Provider } from 'oidc-provider';
import RedisAdapter from './adapter';

import jwks from './jwks.json';

const configuration = {
  clients: [
    {
      client_id: 'foo',
      redirect_uris: ['https://example.com'],
      response_types: ['id_token'],
      grant_types: ['implicit'],
      token_endpoint_auth_method: 'none',
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
