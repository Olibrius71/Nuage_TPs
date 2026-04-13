const express = require('express');
const { pool } = require('../db');
const logger = require('../logger');

const router = express.Router();

// GET /notes
router.get('/', async (req, res) => {
  logger.info('Récupération de toutes les notes');
  try {
    const result = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    logger.error({ err }, 'Erreur lors de la récupération des notes');
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// GET /notes/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    logger.warn({ id }, 'Paramètre id invalide (non numérique)');
    return res.status(400).json({ error: 'id doit être un entier' });
  }

  logger.info({ id }, 'Récupération de la note');
  try {
    const result = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      logger.warn({ id }, 'Note introuvable');
      return res.status(404).json({ error: 'Note introuvable' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    logger.error({ err, id }, 'Erreur lors de la récupération de la note');
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// POST /notes
router.post('/', async (req, res) => {
  const { content } = req.body;

  if (!content || typeof content !== 'string' || content.trim() === '') {
    logger.warn({ body: req.body }, 'Contenu de note manquant ou invalide');
    return res.status(400).json({ error: 'Le champ "content" est requis' });
  }

  logger.info({ content }, 'Création d\'une nouvelle note');
  try {
    const result = await pool.query(
      'INSERT INTO notes (content) VALUES ($1) RETURNING *',
      [content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error({ err }, 'Erreur lors de la création de la note');
    res.status(500).json({ error: 'Erreur interne' });
  }
});

// DELETE /notes/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    logger.warn({ id }, 'Paramètre id invalide pour suppression');
    return res.status(400).json({ error: 'id doit être un entier' });
  }

  logger.info({ id }, 'Suppression de la note');
  try {
    const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      logger.warn({ id }, 'Note introuvable pour suppression');
      return res.status(404).json({ error: 'Note introuvable' });
    }
    res.json({ message: 'Note supprimée', note: result.rows[0] });
  } catch (err) {
    logger.error({ err, id }, 'Erreur lors de la suppression de la note');
    res.status(500).json({ error: 'Erreur interne' });
  }
});

module.exports = router;
