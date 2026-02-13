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
    tipo: z.enum(['LEMBRETE','ORIENTACAO']),
    mensagem: z.string().min(2),
    canal: z.enum(['APP','SMS','EMAIL'])
  })
});

router.post('/', requireAuth, requireRoles(['ADMIN','PROFISSIONAL']), audit({ recurso: 'NOTIFICACAO' }), validate(createSchema), async (req, res) => {
  const { pacienteId, tipo, mensagem, canal } = req.validated.body;
  const n = await prisma.notificacao.create({ data: { pacienteId, tipo, mensagem, canal } });
  return res.status(201).json(n);
});

router.get('/paciente/:pacienteId', requireAuth, audit({ recurso: 'NOTIFICACAO' }), async (req, res) => {
  const pacienteId = Number(req.params.pacienteId);
  const perfil = req.user.perfil;

  if (perfil === 'PACIENTE' && req.user.pacienteId !== pacienteId) return res.status(403).json({ error: 'FORBIDDEN' });
  if (perfil === 'CUIDADOR') {
    const vinculo = await prisma.vinculoCuidador.findUnique({
      where: { pacienteId_cuidadorUserId: { pacienteId, cuidadorUserId: req.user.id } }
    });
    if (!vinculo) return res.status(403).json({ error: 'FORBIDDEN' });
  }

  const data = await prisma.notificacao.findMany({ where: { pacienteId }, orderBy: { id: 'desc' } });
  return res.json(data);
});

module.exports = router;
