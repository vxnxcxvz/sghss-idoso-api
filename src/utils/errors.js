class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function notFound(message = 'Recurso não encontrado') {
  return new HttpError(404, 'NOT_FOUND', message);
}

module.exports = { HttpError, notFound };
