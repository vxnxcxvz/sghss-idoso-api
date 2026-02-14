const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware de autenticacao JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        erro: 'Token nao fornecido',
        mensagem: 'Acesso negado. Faca login para continuar.'
      });
    }

    // Verificar se token foi revogado (se model existir)
    try {
      const tokenRevogado = await prisma.tokenRevogado.findFirst({
        where: { token }
      });

      if (tokenRevogado) {
        return res.status(403).json({ 
          erro: 'Token revogado',
          mensagem: 'Token nao e mais valido.'
        });
      }
    } catch (e) {
      // Model TokenRevogado pode nao existir ainda
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const usuario = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        ativo: true
      }
    });

    if (!usuario || !usuario.ativo) {
      return res.status(403).json({ 
        erro: 'Usuario inativo'
      });
    }
    
    req.usuario = usuario;
    next();
  } catch (erro) {
    if (erro.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        erro: 'Token expirado'
      });
    }
    
    return res.status(403).json({ 
      erro: 'Token invalido'
    });
  }
};

/**
 * Middleware de autorizacao por perfil (RBAC)
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        erro: 'Nao autenticado'
      });
    }

    if (!roles.includes(req.usuario.tipo)) {
      return res.status(403).json({ 
        erro: 'Acesso negado',
        mensagem: `Apenas ${roles.join(', ')} podem acessar.`
      });
    }

    next();
  };
};

/**
 * Middleware para registrar log de auditoria (LGPD)
 */
const logAuditoria = (acao) => {
  return async (req, res, next) => {
    try {
      const userId = req.usuario?.id;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');
      const descricao = `${acao}: ${req.method} ${req.originalUrl}`;

      prisma.logAuditoria.create({
        data: {
          userId,
          acao,
          descricao,
          ipAddress,
          userAgent
        }
      }).catch(err => console.error('Erro ao registrar log:', err));

      next();
    } catch (erro) {
      next();
    }
  };
};

module.exports = { 
  authenticateToken, 
  authorizeRoles, 
  logAuditoria
};
