const client = require('prom-client');

// Collecte automatique des métriques système (CPU, mémoire, event loop…)
client.collectDefaultMetrics();

// Compteur : nombre total de requêtes HTTP
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP reçues',
  labelNames: ['method', 'route', 'status'],
});

// Histogramme : distribution des temps de réponse en secondes
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Distribution des temps de réponse HTTP en secondes',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

// Middleware Express : démarre le timer avant la requête, enregistre après
function metricsMiddleware(req, res, next) {
  const end = httpRequestDurationSeconds.startTimer();

  res.on('finish', () => {
    const route = req.route ? req.baseUrl + req.route.path : req.path;
    const labels = {
      method: req.method,
      route,
      status: res.statusCode,
    };
    httpRequestsTotal.inc(labels);
    end(labels);
  });

  next();
}

// Handler GET /metrics
async function metricsHandler(req, res) {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}

module.exports = { metricsMiddleware, metricsHandler };
