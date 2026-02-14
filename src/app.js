require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const { errorHandler } = require('./middlewares/error');

const authLegacyRoutes = require('./routes/auth.legacy.routes');
const authRoutes = require('./routes/auth.routes');
const pacientesRoutes = require('./routes/pacientes.routes');
const consultasRoutes = require('./routes/consultas.routes');
const prontuariosRoutes = require('./routes/prontuarios.routes');
const prescricoesRoutes = require('./routes/prescricoes.routes');
const notificacoesRoutes = require('./routes/notificacoes.routes');
const relatoriosRoutes = require('./routes/relatorios.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Swagger
try {
  const doc = YAML.load(require('path').join(__dirname, '../docs/openapi.yaml'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(doc));
} catch (e) {
  // Se o YAML não carregar, não derruba a API
}

app.use('/auth', authLegacyRoutes);
app.use('/api/auth', authRoutes);
app.use('/pacientes', pacientesRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/consultas', consultasRoutes);
app.use('/prontuarios', prontuariosRoutes);
app.use('/prescricoes', prescricoesRoutes);
app.use('/notificacoes', notificacoesRoutes);
app.use('/relatorios', relatoriosRoutes);

app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND' }));
app.use(errorHandler);

module.exports = { app };
