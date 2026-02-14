const express = require('express');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const { prisma } = require('../utils/prisma');
const { signToken } = require('../utils/jwt');
const { validate } = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

function mapTipoToPerfil(tipo) {
  const t = (tipo || '').toUpperCase();
  if (t === 'ADMINISTRADOR') return 'ADMIN';
  if (t === 'MEDICO' || t === 'ENFERMEIRO') return 'PROFISSIONAL';
  if (t === 'PACIENTE') return 'PACIENTE';
  return 'PACIENTE';
}

function normalizePerfil(body) {
  if (body.perfil) return body.perfil;
  if (body.tipo) return mapTipoToPerfil(body.tipo);
  return 'PACIENTE';
}

const registerSchema = z.object({
  body: z.object({
    nome: z.string().min(2),
    email: z.string().email(),
    senha: z.string().min(6),
    perfil: z.enum(['ADMIN', 'PROFISSIONAL', 'PACIENTE', 'CUIDADOR']).optional(),
    pacienteId: z.number().int().positive().optional(),
    tipo: z.enum(['PACIENTE', 'MEDICO', 'ENFERMEIRO', 'ADMINISTRADOR']).optional()
  })
});

async function handleRegister(req, res, next) {
  try {
    const { nome, email, senha, pacienteId } = req.validated.body;
    const perfil = normalizePerfil(req.validated.body);
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const senhaHash = await bcrypt.hash(senha, rounds);
    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        perfil,
        pacienteId: pacienteId ?? null
      }
    });
    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        pacienteId: user.pacienteId
      }
    });
  } catch (e) {
    if (e && e.code === 'P2002') {
      return res.status(409).json({ error: 'CONFLICT', message: 'Email já cadastrado' });
    }
    return next(e);
  }
}

router.post('/signup', validate(registerSchema), handleRegister);
router.post('/register', validate(registerSchema), handleRegister);

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    senha: z.string().min(1)
  })
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, senha } = req.validated.body;
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const ok = await bcrypt.compare(senha, user.senhaHash);
    if (!ok) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const token = signToken({
      id: user.id,
      perfil: user.perfil,
      pacienteId: user.pacienteId ?? null
    });
    return res.json({
      message: 'Login realizado com sucesso',
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });
  } catch (e) {
    return next(e);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.user.id);
    const user = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        pacienteId: true
      }
    });
    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });
    return res.json({ usuario: user });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
