const express = require('express');
const { z } = require('zod');
const { prisma } = require('../utils/prisma');
const { requireAuth } = require('../middlewares/auth');
const { requireRoles } = require('../middlewares/rbac');
const { validate } = require('../middlewares/validate');
const { audit } = require('../middlewares/audit');

const router = express.Router();

const createSchema = z.object({
  body: z.object({
    pacienteId: z.number().int().positive(),
    profissionalId: z.number().int().positive(),
    dataHora: z.string().min(8),
    motivo: z.string().optional()
  })
});

router.post('/', requireAuth, requireRoles(['ADMIN','PROFISSIONAL']), audit({ recurso: 'CONSULTA' }), validate(createSchema), async (req, res) => {
  const { pacienteId, profissionalId, dataHora, motivo } = req.validated.body;
  const when = new Date(dataHora);

  // conflito simples: mesmo profissional e mesmo horário
  const conflict = await prisma.consulta.findFirst({
    where: { profissionalId, dataHora: when, status: { in: ['AGENDADA','REALIZADA'] } }
  });
  if (conflict) return res.status(409).json({ error: 'CONFLICT', message: 'Conflito de agenda' });

  const consulta = await prisma.consulta.create({
    data: { pacienteId, profissionalId, dataHora: when, motivo: motivo ?? null }
  });
  return res.status(201).json(consulta);
});

router.get('/', requireAuth, async (req, res) => {
  const perfil = req.user.perfil;
  const where = {};

  // filtros
  if (req.query.pacienteId) where.pacienteId = Number(req.query.pacienteId);
  if (req.query.profissionalId) where.profissionalId = Number(req.query.profissionalId);
  if (req.query.status) where.status = req.query.status;

  // restrições por perfil
  if (perfil === 'PACIENTE') {
    if (!req.user.pacienteId) return res.status(403).json({ error: 'FORBIDDEN' });
    where.pacienteId = req.user.pacienteId;
  }
  if (perfil === 'CUIDADOR') {
    // cuidador vê consultas dos pacientes vinculados: simplificado via pacienteId obrigatório
    if (!where.pacienteId) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Informe pacienteId para cuidador' });
    const vinculo = await prisma.vinculoCuidador.findUnique({
      where: { pacienteId_cuidadorUserId: { pacienteId: where.pacienteId, cuidadorUserId: req.user.id } }
    });
    if (!vinculo) return res.status(403).json({ error: 'FORBIDDEN' });
  }

  const data = await prisma.consulta.findMany({ where, orderBy: { dataHora: 'desc' } });
  return res.json(data);
});

const cancelSchema = z.object({
  body: z.object({
    motivoCancelamento: z.string().min(2)
  })
});

router.patch('/:id/cancelar', requireAuth, requireRoles(['ADMIN','PROFISSIONAL']), audit({ recurso: 'CONSULTA', recursoIdParam: 'id' }), validate(cancelSchema), async (req, res) => {
  const id = Number(req.params.id);
  const { motivoCancelamento } = req.validated.body;
  try {
    const updated = await prisma.consulta.update({
      where: { id },
      data: { status: 'CANCELADA', motivoCancelamento }
    });
    return res.json(updated);
  } catch (e) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }
});

module.exports = router;
