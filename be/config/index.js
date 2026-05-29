const requiredEnv = [
  'AUTH_URL',
  'BASE_URL',
  'PORT'
];

const config = {
  port: process.env.PORT || 8000,
  authUrl: process.env.AUTH_URL,
  baseUrl: process.env.BASE_URL,
  clientId: process.env.SATUSEHAT_CLIENT_ID || process.env.CLIENT_ID,
  clientSecret: process.env.SATUSEHAT_CLIENT_SECRET || process.env.CLIENT_SECRET
};

function validateConfig() {
  const missing = requiredEnv.filter((key) => !config[key.toLowerCase()] && !process.env[key]);

  if (!config.clientId) missing.push('SATUSEHAT_CLIENT_ID or CLIENT_ID');
  if (!config.clientSecret) missing.push('SATUSEHAT_CLIENT_SECRET or CLIENT_SECRET');

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { config, validateConfig };