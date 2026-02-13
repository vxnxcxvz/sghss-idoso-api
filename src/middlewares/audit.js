const { prisma } = require('../utils/prisma');

function audit(options = {}) {
  return async (req, _res, next) => {
    try {
      const usuarioId = req.user?.id ?? null;
      const acao = options.acao || `${req.method} ${req.originalUrl}`;
      const rota = req.originalUrl;
      const recurso = options.recurso || null;
      const recursoId = options.recursoIdParam ? Number(req.params[options.recursoIdParam]) : null;
      const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || null;

      await prisma.auditoria.create({
        data: { usuarioId, acao, rota, recurso, recursoId, ip }
      });
    } catch (e) {
      // Não quebra requisição por falha de auditoria
    }
    next();
  };
}

module.exports = { audit };
