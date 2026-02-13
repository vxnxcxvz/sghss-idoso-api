const { ZodError } = require('zod');
const { HttpError } = require('../utils/errors');

function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.code, message: err.message, details: err.details });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.flatten() });
  }
  console.error(err);
  return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
}

module.exports = { errorHandler };
