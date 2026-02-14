// routes/auth.routes.js
// Usando Prisma (corrigido)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Campos obrigatórios' });
    }

    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    
    const usuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        tipo: tipo || 'PACIENTE'
      },
      select: { id: true, nome: true, email: true, tipo: true }
    });

    res.status(201).json({ mensagem: 'Usuário criado', usuario });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ mensagem: 'Login OK', token });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no login' });
  }
});

module.exports = router;
// routes/auth.routes.js
// Usando Prisma (corrigido)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Campos obrigatórios' });
    }

    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    
    const usuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        tipo: tipo || 'PACIENTE'
      },
      select: { id: true, nome: true, email: true, tipo: true }
    });

    res.status(201).json({ mensagem: 'Usuário criado', usuario });
  } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ mensagem: 'Login OK', token });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no login' });
  }
});

module.exports = router;
// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // Ajuste conforme sua configuração

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário (Paciente, Médico, Administrador)
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, cpf, tipo, crm, especialidade } = req.body;

    // Validações básicas
    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ 
        erro: 'Campos obrigatórios não preenchidos',
        mensagem: 'Nome, email, senha e tipo são obrigatórios.'
      });
    }

    // Validar tipo de usuário
    const tiposValidos = ['paciente', 'medico', 'administrador', 'enfermeiro'];
    if (!tiposValidos.includes(tipo.toLowerCase())) {
      return res.status(400).json({ 
        erro: 'Tipo de usuário inválido',
        mensagem: `Tipo deve ser um dos seguintes: ${tiposValidos.join(', ')}`
      });
    }

    // Verificar se email já existe
    const [usuarioExistente] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarioExistente.length > 0) {
      return res.status(409).json({ 
        erro: 'Email já cadastrado',
        mensagem: 'Este email já está em uso. Tente fazer login ou use outro email.'
      });
    }

    // Criptografar senha (LGPD - Segurança)
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // Inserir usuário no banco
    const query = `
      INSERT INTO usuarios (nome, email, senha, cpf, tipo, crm, especialidade, criado_em)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const [resultado] = await db.query(query, [
      nome, 
      email, 
      senhaHash, 
      cpf || null, 
      tipo.toLowerCase(),
      crm || null,
      especialidade || null
    ]);

    // Log de auditoria (LGPD - Compliance)
    await db.query(
      'INSERT INTO logs_auditoria (usuario_id, acao, descricao, data_hora) VALUES (?, ?, ?, NOW())',
      [resultado.insertId, 'REGISTRO', `Novo usuário cadastrado: ${email}`]
    );

    res.status(201).json({ 
      mensagem: 'Usuário cadastrado com sucesso',
      usuario: {
        id: resultado.insertId,
        nome,
        email,
        tipo: tipo.toLowerCase()
      }
    });

  } catch (erro) {
    console.error('Erro ao registrar usuário:', erro);
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível cadastrar o usuário. Tente novamente mais tarde.'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuário e retornar token JWT
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({ 
        erro: 'Credenciais incompletas',
        mensagem: 'Email e senha são obrigatórios.'
      });
    }

    // Buscar usuário no banco
    const [usuarios] = await db.query(
      'SELECT id, nome, email, senha, tipo, ativo FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ 
        erro: 'Credenciais inválidas',
        mensagem: 'Email ou senha incorretos.'
      });
    }

    const usuario = usuarios[0];

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      return res.status(403).json({ 
        erro: 'Conta desativada',
        mensagem: 'Sua conta foi desativada. Entre em contato com o suporte.'
      });
    }

    // Comparar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      // Log de tentativa de login falhada (Segurança)
      await db.query(
        'INSERT INTO logs_auditoria (usuario_id, acao, descricao, data_hora) VALUES (?, ?, ?, NOW())',
        [usuario.id, 'LOGIN_FALHOU', `Tentativa de login com senha incorreta: ${email}`]
      );

      return res.status(401).json({ 
        erro: 'Credenciais inválidas',
        mensagem: 'Email ou senha incorretos.'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        nome: usuario.nome
      },
      process.env.JWT_SECRET || 'seu_secret_key_aqui',
      { expiresIn: '24h' } // Token válido por 24 horas
    );

    // Log de login bem-sucedido (Auditoria LGPD)
    await db.query(
      'INSERT INTO logs_auditoria (usuario_id, acao, descricao, data_hora) VALUES (?, ?, ?, NOW())',
      [usuario.id, 'LOGIN', `Login realizado com sucesso: ${email}`]
    );

    res.json({ 
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });

  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    res.status(500).json({ 
      erro: 'Erro interno do servidor',
      mensagem: 'Não foi possível realizar o login. Tente novamente mais tarde.'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Registrar logout do usuário (log de auditoria)
 * @access  Private
 */
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_key_aqui');
      
      // Log de logout (Auditoria)
      await db.query(
        'INSERT INTO logs_auditoria (usuario_id, acao, descricao, data_hora) VALUES (?, ?, ?, NOW())',
        [decoded.id, 'LOGOUT', `Logout realizado: ${decoded.email}`]
      );
    }

    res.json({ mensagem: 'Logout realizado com sucesso' });
  } catch (erro) {
    res.json({ mensagem: 'Logout realizado' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Obter dados do usuário autenticado
 * @access  Private
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_key_aqui');

    const [usuarios] = await db.query(
      'SELECT id, nome, email, tipo, cpf, crm, especialidade, criado_em FROM usuarios WHERE id = ?',
      [decoded.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json({ usuario: usuarios[0] });

  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
    res.status(500).json({ erro: 'Erro ao buscar dados do usuário' });
  }
});

module.exports = router;
