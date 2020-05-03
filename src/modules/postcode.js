import axios from 'axios';

export const lookup = (postcode) => axios.get(`https://api.postcodes.io/postcodes/${postcode}`);
