const axios = require('axios');
const { config } = require('../config');

let cachedToken = null;
let tokenExpiry = 0;

function buildAuthUrl(baseAuthUrl) {
  const trimmed = baseAuthUrl.trim();

  if (trimmed.endsWith('/token')) {
    return trimmed;
  }

  if (trimmed.includes('/accesstoken')) {
    return trimmed;
  }

  return `${trimmed.replace(/\/$/, '')}/accesstoken?grant_type=client_credentials`;
}

async function requestNewToken() {
  const authUrl = buildAuthUrl(config.authUrl);
  const bodyParams = new URLSearchParams();
  bodyParams.append('client_id', config.clientId);
  bodyParams.append('client_secret', config.clientSecret);
  bodyParams.append('grant_type', 'client_credentials');

  const response = await axios.post(authUrl, bodyParams.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
    timeout: 15000,
    validateStatus: () => true
  });

  const data = response.data;
  if (!data || !data.access_token) {
    const responseBody = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`SATUSEHAT auth response tidak berisi access_token. url=${authUrl} status=${response.status} body=${responseBody}`);
  }

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in ? Number(data.expires_in) * 1000 : 300000);
  return cachedToken;
}

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry - 10000) {
    return cachedToken;
  }

  return await requestNewToken();
}

module.exports = { getAccessToken };