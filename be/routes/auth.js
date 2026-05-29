const express = require('express');
const { getAccessToken } = require('../services/tokenService');

const router = express.Router();

router.get('/test-auth', async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ success: true, message: 'Berhasil mendapatkan token', accessToken: token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;