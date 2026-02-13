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
    prontuarioId: z.number().int().positive(),
    medicamento: z.string().min(2),
    posologia: z.string().min(2),
    duracaoDias: z.number().int().positive(),
    observacoes: z.string().optional()
  })
});

router.post('/', requireAuth, requireRoles(['PROFISSIONAL']), audit({ recurso: 'PRESCRICAO' }), validate(createSchema), async (req, res) => {
  const { prontuarioId, medicamento, posologia, duracaoDias, observacoes } = req.validated.body;
  const prontuario = await prisma.prontuario.findUnique({ where: { id: prontuarioId }, include: { consulta: true } });
  if (!prontuario) return res.status(404).json({ error: 'NOT_FOUND' });
  if (prontuario.consulta.profissionalId !== req.user.id) return res.status(403).json({ error: 'FORBIDDEN' });

  const prescricao = await prisma.prescricao.create({
    data: { prontuarioId, medicamento, posologia, duracaoDias, observacoes: observacoes ?? null }
  });
  return res.status(201).json(prescricao);
});

router.get('/paciente/:pacienteId', requireAuth, audit({ recurso: 'PRESCRICAO' }), async (req, res) => {
  const pacienteId = Number(req.params.pacienteId);
  const perfil = req.user.perfil;

  if (perfil === 'PACIENTE' && req.user.pacienteId !== pacienteId) return res.status(403).json({ error: 'FORBIDDEN' });
  if (perfil === 'CUIDADOR') {
    const vinculo = await prisma.vinculoCuidador.findUnique({
      where: { pacienteId_cuidadorUserId: { pacienteId, cuidadorUserId: req.user.id } }
    });
    if (!vinculo) return res.status(403).json({ error: 'FORBIDDEN' });
  }

  const data = await prisma.prescricao.findMany({
    where: { prontuario: { consulta: { pacienteId } } },
    include: { prontuario: { include: { consulta: true } } },
    orderBy: { id: 'desc' }
  });
  return res.json(data);
});

module.exports = router;
