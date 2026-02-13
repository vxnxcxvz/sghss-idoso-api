const express = require('express');
const { prisma } = require('../utils/prisma');
const { requireAuth } = require('../middlewares/auth');
const { requireRoles } = require('../middlewares/rbac');

const router = express.Router();

router.get('/consultas', requireAuth, requireRoles(['ADMIN']), async (req, res) => {
  const inicio = req.query.inicio ? new Date(req.query.inicio) : null;
  const fim = req.query.fim ? new Date(req.query.fim) : null;

  const where = {};
  if (inicio || fim) {
    where.dataHora = {};
    if (inicio) where.dataHora.gte = inicio;
    if (fim) where.dataHora.lte = fim;
  }

  const total = await prisma.consulta.count({ where });
  const porStatus = await prisma.consulta.groupBy({
    by: ['status'],
    where,
    _count: { status: true }
  });

  const map = {};
  for (const row of porStatus) map[row.status] = row._count.status;

  return res.json({
    periodo: { inicio: inicio?.toISOString() || null, fim: fim?.toISOString() || null },
    total,
    porStatus: map
  });
});

module.exports = router;
