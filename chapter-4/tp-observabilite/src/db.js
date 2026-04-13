const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  logger.info('Connexion au pool PostgreSQL établie');
});

pool.on('error', (err) => {
  logger.error({ err }, 'Erreur inattendue sur le pool PostgreSQL');
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  logger.info('Table "notes" prête');
}

module.exports = { pool, initDb };
