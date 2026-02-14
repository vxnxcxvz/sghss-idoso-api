const express = require('express');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const { prisma } = require('../utils/prisma');
const { signToken } = require('../utils/jwt');
const { validate } = require('../middlewares/validate');

const router = express.Router();

const signupSchema = z.object({
  body: z.object({
    nome: z.string().min(2),
    email: z.string().email(),
    senha: z.string().min(6),
    perfil: z.enum(['ADMIN','PROFISSIONAL','PACIENTE','CUIDADOR']).default('PACIENTE'),
    pacienteId: z.number().int().positive().optional()
  })
});

router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const { nome, email, senha, perfil, pacienteId } = req.validated.body;
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const senhaHash = await bcrypt.hash(senha, rounds);

    const user = await prisma.usuario.create({
      data: { nome, email, senhaHash, perfil, pacienteId: pacienteId ?? null }
    });

    return res.status(201).json({ id: user.id, email: user.email, perfil: user.perfil });
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'CONFLICT', message: 'Email j\u00e1 cadastrado' });
    return next(e);
  }
});

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

    const token = signToken({ id: user.id, perfil: user.perfil, pacienteId: user.pacienteId ?? null });
    return res.json({ token, expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
