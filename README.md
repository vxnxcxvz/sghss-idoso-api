# 🏥 SGHSS - Sistema de Gestão Hospitalar

Sistema de back-end para gestão hospitalar desenvolvido com Node.js, Express e Prisma.

## 🚀 Tecnologias

- **Node.js** 18+
- **Express** 4.x
- **Prisma** ORM
- **PostgreSQL**
- **JWT** para autenticação
- **bcrypt** para senhas

## 📦 Instalação

```
bash
# Clonar repositório
git clone https://github.com/vxnxcxvz/desenvolvimento-back-end.git
cd desenvolvimento-back-end

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Executar migrações
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate

# Iniciar servidor
npm run dev
```

## 🔐 Autenticação

O sistema usa JWT para autenticação. Endpoints protegidos requerem header:
```
Authorization: Bearer {token}
```

## 📚 Documentação

- **Swagger UI:** http://localhost:3000/docs
- **Postman Collection:** `docs/postman_collection.json`
- **OpenAPI Spec:** `docs/openapi.yaml`

## 🧪 Testes

Importar `docs/postman_collection.json` no Postman e executar os casos de teste.

## 📋 Endpoints Principais

### Autenticação
- POST `/api/auth/register` - Registrar usuário
- POST `/api/auth/login` - Fazer login
- GET `/api/auth/me` - Dados do usuário logado

### Pacientes
- GET `/api/pacientes` - Listar pacientes (autenticado)
- GET `/api/pacientes/:id` - Buscar paciente
- POST `/api/pacientes` - Criar paciente (admin)
- PUT `/api/pacientes/:id` - Atualizar paciente
- DELETE `/api/pacientes/:id` - Excluir paciente (admin)

### Consultas
- GET `/api/consultas` - Listar consultas
- POST `/api/consultas` - Agendar consulta
- PUT `/api/consultas/:id` - Atualizar consulta
- DELETE `/api/consultas/:id` - Cancelar consulta

## 🔒 Segurança

- ✅ Autenticação JWT
- ✅ Senhas com hash bcrypt
- ✅ RBAC (controle de acesso por perfil)
- ✅ Logs de auditoria (LGPD)
- ✅ Validação de entrada com Zod

## 💳 LGPD Compliance

Todas as ações são registradas em `logs_auditoria` incluindo:
- LOGIN/LOGOUT
- CRIACAO/ATUALIZACAO/EXCLUSAO
- ACESSO a dados sensíveis

## 👨‍🎓 Autor

Vinícius Pereira Carvalho

## 📄 Licença

MIT
Plataforma Web de Suporte ao Cuidado do Idoso - API REST

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Express](https://img.shields.io/badge/Express-4.18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.8-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

API REST completa para gestão do cuidado ao idoso, integrável ao Sistema de Gestão Hospitalar e de Serviços de Saúde (SGHSS) da instituição VidaPlus.

## Sobre o Projeto

Este projeto implementa o back-end de uma plataforma web focada no suporte ao cuidado do idoso, contemplando:

- ✅ Autenticação segura com JWT e hash bcrypt
- ✅ Controle de acesso baseado em perfis (RBAC)
- ✅ CRUD completo de pacientes idosos
- ✅ Sistema de agendamento de consultas com validação de disponibilidade
- ✅ Registro de prontuários médicos
- ✅ Emissão de prescrições
- ✅ Sistema de notificações
- ✅ Relatórios administrativos
- ✅ Auditoria de ações sensíveis (compliance LGPD)
- ✅ Logs estruturados com Winston

## Tecnologias Utilizadas

### Core
- **Node.js** v20.11.0 LTS - Runtime JavaScript
- **Express.js** v4.18.2 - Framework web
- **TypeScript** v5.3.3 - Type safety

### Banco de Dados
- **PostgreSQL** v16.1 - SGBD relacional
- **Prisma** v5.8.1 - ORM type-safe com migrations

### Autenticação e Segurança
- **jsonwebtoken** v9.0.2 - Geração e validação de JWT
- **bcrypt** v5.1.1 - Hash seguro de senhas
- **Zod** v3.22.4 - Validação de schemas

### Observabilidade
- **Winston** v3.11.0 - Logging estruturado

### Desenvolvimento
- **ts-node** v10.9.2 - Execução TypeScript
- **nodemon** v3.0.2 - Hot reload
- **Postman** v10.20.0 - Testes de API

## Estrutura do Projeto

```
desenvolvimento-back-end/
├── src/
│   ├── app.ts                      # Configuração do Express
│   ├── server.ts                   # Inicialização do servidor
│   ├── routes/                     # Definição de rotas
│   ├── controllers/                # Lógica de controle
│   ├── services/                   # Regras de negócio
│   ├── repositories/               # Acesso a dados (Prisma)
│   ├── middlewares/                # Auth, RBAC, validation, logs
│   ├── utils/                      # Funções auxiliares
│   ├── types/                      # Definições TypeScript
│   └── config/                     # Configurações
├── prisma/
│   ├── schema.prisma               # Schema do banco
│   └── migrations/                 # Histórico de migrações
├── docs/
│   ├── openapi.yaml                # Documentação OpenAPI
│   └── postman_collection.json     # Coleção Postman
├── .env.example                    # Template de variáveis
├── package.json
├── tsconfig.json
└── README.md
```

## Instalação e Configuração

### Pré-requisitos

- Node.js v20.x ou superior
- PostgreSQL v16.x
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/vxnxcxvz/desenvolvimento-back-end.git
cd desenvolvimento-back-end
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sghss_vidaplus"

# JWT
JWT_SECRET="seu_secret_super_seguro_aqui_minimo_32_caracteres"
JWT_EXPIRES_IN="1h"

# Servidor
PORT=3000
NODE_ENV="development"

# Logs
LOG_LEVEL="info"
```

4. **Execute as migrations do banco**
```bash
npx prisma migrate dev
```

5. **(Opcional) Popule o banco com dados de teste**
```bash
npx prisma db seed
```

6. **Inicie o servidor**
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3000`

## Documentação da API

### Swagger/OpenAPI

Acesse a documentação interativa em:
```
http://localhost:3000/api-docs
```

### Postman Collection

Importe a coleção do Postman localizada em:
```
docs/postman_collection.json
```

### Endpoints Principais

#### Autenticação
- `POST /auth/signup` - Cadastro de usuário
- `POST /auth/login` - Login e obtenção de token JWT

#### Pacientes
- `POST /pacientes` - Cadastrar paciente
- `GET /pacientes` - Listar pacientes (paginado)
- `GET /pacientes/:id` - Buscar paciente por ID
- `PUT /pacientes/:id` - Atualizar paciente
- `DELETE /pacientes/:id` - Remover paciente (ADMIN only)

#### Consultas
- `POST /consultas` - Agendar consulta
- `GET /consultas` - Listar consultas (com filtros)
- `PATCH /consultas/:id/cancelar` - Cancelar consulta

#### Prontuários
- `POST /prontuarios` - Registrar prontuário
- `GET /prontuarios` - Listar prontuários

#### Prescrições
- `POST /prescricoes` - Emitir prescrição
- `GET /prescricoes` - Listar prescrições

#### Notificações
- `POST /notificacoes` - Enviar notificação
- `GET /notificacoes` - Listar notificações

#### Relatórios
- `GET /relatorios/consultas` - Relatório de consultas (ADMIN only)

## Autenticação e Autorização

### JWT (JSON Web Token)

Todas as rotas (exceto signup/login) exigem autenticação via JWT no header:
```
Authorization: Bearer {seu_token_aqui}
```

### Perfis (RBAC)

- **ADMIN**: Acesso completo ao sistema
- **PROFISSIONAL**: Gerencia pacientes, consultas, prontuários, prescrições
- **PACIENTE**: Visualiza próprios dados e histórico
- **CUIDADOR**: Visualiza dados de pacientes vinculados

## 🧪 Testes

### Testes Manuais (Postman)

1. Importe a coleção `docs/postman_collection.json`
2. Configure a variável `{{baseUrl}}` para `http://localhost:3000`
3. Execute a pasta "Auth" → "Login" para obter o token
4. O token será automaticamente salvo na variável `{{token}}`
5. Execute os demais testes

### Casos de Teste Documentados

O projeto inclui 13 casos de teste formais:
- CT01: Sign-up válido
- CT02: Login válido
- CT03: Login inválido
- CT04: Cadastrar paciente válido
- CT05: Cadastrar paciente sem CPF
- CT06: Listar pacientes
- CT07: Agendar consulta
- CT08: Conflito de agenda
- CT09: Cancelar consulta
- CT10: Registrar prontuário
- CT11: Emitir prescrição
- CT12: Acesso sem token
- CT13: RBAC bloqueio

## Diagrama de Arquitetura

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────────┐
│         Express Middleware          │
├─────────────────────────────────────┤
│  Logger → Auth → RBAC → Validation  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│ Controllers │ ───> │   Services   │
└─────────────┘      └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Repositories │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │    Prisma    │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  PostgreSQL  │
                     └──────────────┘
```



Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.


