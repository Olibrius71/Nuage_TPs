const express = require('express');
const { pool } = require('../db');
const logger = require('../logger');

const router = express.Router();

// GET /health — l'application tourne-t-elle ?
router.get('/', (req, res) => {
  logger.info('Health check basique OK');
  res.status(200).json({ status: 'ok' });
});

// GET /health/db — la base de données est-elle accessible ?
router.get('/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    logger.info('Health check DB OK');
    res.status(200).json({ status: 'ok', db: 'reachable' });
  } catch (err) {
    logger.error({ err }, 'Health check DB échoué — base inaccessible');
    res.status(503).json({ status: 'error', db: 'unreachable', message: err.message });
  }
});

module.exports = router;
