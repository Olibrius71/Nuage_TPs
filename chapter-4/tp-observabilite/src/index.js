const express = require('express');
const logger = require('./logger');
const { initDb } = require('./db');
const notesRouter = require('./routes/notes');
const healthRouter = require('./routes/health');
const { metricsMiddleware, metricsHandler } = require('./metrics');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Collecte des métriques Prometheus (avant le log pour mesurer dès l'entrée)
app.use(metricsMiddleware);

// Log de chaque requête entrante
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Requête reçue');
  next();
});

app.get('/', (req, res) => {
  logger.info('Accès à la route racine');
  res.json({ message: 'API Notes opérationnelle' });
});

app.get('/metrics', metricsHandler);

app.use('/health', healthRouter);
app.use('/notes', notesRouter);

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  logger.error({ err, method: req.method, url: req.url }, 'Erreur non gérée');
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      logger.info({ port: PORT }, 'Serveur démarré');
    });
  } catch (err) {
    logger.error({ err }, 'Impossible de démarrer le serveur');
    process.exit(1);
  }
}

start();
