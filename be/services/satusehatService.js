const axios = require('axios');
const { config } = require('../config');
const { getAccessToken } = require('./tokenService');

const client = axios.create({
  baseURL: config.baseUrl,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/fhir+json'
  }
});

async function createFhirResource(resourceType, payload) {
  const token = await getAccessToken();

  const response = await client.post(`/${resourceType}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}

async function searchFhirResource(resourceType, params = {}) {
  const token = await getAccessToken();

  const response = await client.get(`/${resourceType}`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}

module.exports = { createFhirResource, searchFhirResource };