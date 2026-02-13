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
    consultaId: z.number().int().positive(),
    evolucao: z.string().min(5),
    sinaisVitais: z.string().optional()
  })
});

router.post('/', requireAuth, requireRoles(['PROFISSIONAL']), audit({ recurso: 'PRONTUARIO' }), validate(createSchema), async (req, res) => {
  const { consultaId, evolucao, sinaisVitais } = req.validated.body;
  const consulta = await prisma.consulta.findUnique({ where: { id: consultaId } });
  if (!consulta) return res.status(404).json({ error: 'NOT_FOUND' });
  if (consulta.profissionalId !== req.user.id) return res.status(403).json({ error: 'FORBIDDEN' });
  if (consulta.status === 'CANCELADA') return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Consulta cancelada' });

  const prontuario = await prisma.prontuario.create({
    data: { consultaId, evolucao, sinaisVitais: sinaisVitais ?? null }
  });
  return res.status(201).json(prontuario);
});

router.get('/paciente/:pacienteId', requireAuth, audit({ recurso: 'PRONTUARIO' }), async (req, res) => {
  const pacienteId = Number(req.params.pacienteId);
  const perfil = req.user.perfil;

  if (perfil === 'PACIENTE' && req.user.pacienteId !== pacienteId) return res.status(403).json({ error: 'FORBIDDEN' });
  if (perfil === 'CUIDADOR') {
    const vinculo = await prisma.vinculoCuidador.findUnique({
      where: { pacienteId_cuidadorUserId: { pacienteId, cuidadorUserId: req.user.id } }
    });
    if (!vinculo) return res.status(403).json({ error: 'FORBIDDEN' });
  }
  if (!['ADMIN','PROFISSIONAL','PACIENTE','CUIDADOR'].includes(perfil)) return res.status(403).json({ error: 'FORBIDDEN' });

  const data = await prisma.prontuario.findMany({
    where: { consulta: { pacienteId } },
    include: { consulta: true, prescricoes: true },
    orderBy: { id: 'desc' }
  });
  return res.json(data);
});

module.exports = router;
