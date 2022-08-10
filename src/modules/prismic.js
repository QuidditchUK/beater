import fetch from 'node-fetch';
import * as Prismic from '@prismicio/client';

const REF_API_URL = 'https://chaser.cdn.prismic.io/api/v2';
const API_TOKEN = process.env.PRISMIC_API_TOKEN;

export const Client = Prismic.createClient(REF_API_URL, { accessToken: API_TOKEN, fetch });
