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
    nome: z.string().min(2),
    cpf: z.string().min(11),
    dataNascimento: z.string().min(8),
    telefone: z.string().optional(),
    endereco: z.string().optional(),
    contatoEmergencia: z.string().optional()
  })
});

router.post('/', requireAuth, requireRoles(['ADMIN','PROFISSIONAL']), audit({ recurso: 'PACIENTE' }), validate(createSchema), async (req, res) => {
  const { nome, cpf, dataNascimento, telefone, endereco, contatoEmergencia } = req.validated.body;
  try {
    const paciente = await prisma.paciente.create({
      data: {
        nome,
        cpf,
        dataNascimento: new Date(dataNascimento),
        telefone: telefone ?? null,
        endereco: endereco ?? null,
        contatoEmergencia: contatoEmergencia ?? null
      }
    });
    return res.status(201).json(paciente);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'CONFLICT', message: 'CPF já cadastrado' });
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
});

router.get('/', requireAuth, requireRoles(['ADMIN','PROFISSIONAL']), async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
  const skip = (page - 1) * limit;
  const q = (req.query.q || '').toString();
  const where = q ? { OR: [{ nome: { contains: q, mode: 'insensitive' } }, { cpf: { contains: q } }] } : {};

  const [total, data] = await Promise.all([
    prisma.paciente.count({ where }),
    prisma.paciente.findMany({ where, skip, take: limit, orderBy: { id: 'desc' } })
  ]);
  return res.json({ page, limit, total, data });
});

router.get('/:id', requireAuth, audit({ recurso: 'PACIENTE', recursoIdParam: 'id' }), async (req, res) => {
  const id = Number(req.params.id);
  const paciente = await prisma.paciente.findUnique({ where: { id } });
  if (!paciente) return res.status(404).json({ error: 'NOT_FOUND' });

  const perfil = req.user.perfil;
  if (perfil === 'ADMIN' || perfil === 'PROFISSIONAL') return res.json(paciente);

  // PACIENTE pode ler o próprio
  if (perfil === 'PACIENTE' && req.user.pacienteId === id) return res.json(paciente);

  // CUIDADOR pode ler se houver vínculo
  if (perfil === 'CUIDADOR') {
    const vinculo = await prisma.vinculoCuidador.findUnique({
      where: { pacienteId_cuidadorUserId: { pacienteId: id, cuidadorUserId: req.user.id } }
    });
    if (vinculo) return res.json(paciente);
  }

  return res.status(403).json({ error: 'FORBIDDEN' });
});

const updateSchema = z.object({
  body: z.object({
    nome: z.string().min(2).optional(),
    telefone: z.string().optional(),
    endereco: z.string().optional(),
    contatoEmergencia: z.string().optional()
  })
});

router.put('/:id', requireAuth, requireRoles(['ADMIN','PROFISSIONAL']), audit({ recurso: 'PACIENTE', recursoIdParam: 'id' }), validate(updateSchema), async (req, res) => {
  const id = Number(req.params.id);
  try {
    const paciente = await prisma.paciente.update({
      where: { id },
      data: {
        ...req.validated.body
      }
    });
    return res.json(paciente);
  } catch (e) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }
});

router.delete('/:id', requireAuth, requireRoles(['ADMIN']), audit({ recurso: 'PACIENTE', recursoIdParam: 'id' }), async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.paciente.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }
});

// Vincular cuidador a paciente
const vinculoSchema = z.object({
  body: z.object({
    cuidadorUserId: z.number().int().positive(),
    grau: z.string().optional()
  })
});

router.post('/:id/vinculos', requireAuth, requireRoles(['ADMIN','PROFISSIONAL']), audit({ recurso: 'VINCULO_CUIDADOR', recursoIdParam: 'id' }), validate(vinculoSchema), async (req, res) => {
  const pacienteId = Number(req.params.id);
  const { cuidadorUserId, grau } = req.validated.body;
  try {
    const vinculo = await prisma.vinculoCuidador.create({
      data: { pacienteId, cuidadorUserId, grau: grau ?? null }
    });
    return res.status(201).json(vinculo);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'CONFLICT', message: 'Vínculo já existe' });
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
});

module.exports = router;
