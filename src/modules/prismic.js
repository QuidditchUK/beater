import Prismic from '@prismicio/client';

const REF_API_URL = 'https://chaser.cdn.prismic.io/api/v2';
const API_TOKEN = process.env.PRISMIC_API_TOKEN;

const createClientOptions = (req = null, prismicAccessToken = null) => {
  const reqOption = req ? { req } : {};
  const accessTokenOption = prismicAccessToken
    ? { accessToken: prismicAccessToken }
    : {};

  return {
    ...reqOption,
    ...accessTokenOption,
  };
};

export const Client = (req = null) => Prismic.client(REF_API_URL, createClientOptions(req, API_TOKEN));
