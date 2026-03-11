# SGHSS VidaPlus — Desenvolvimento Back-end

API REST do SGHSS VidaPlus (Node.js + Express + Prisma + PostgreSQL), com autenticação JWT e documentação Swagger.

## Requisitos
- Node.js >= 18
- PostgreSQL

## Rodar o projeto
```bash
npm install
cp .env.example .env
# edite DATABASE_URL e JWT_SECRET
npx prisma generate
npx prisma migrate dev
npm run dev
```

URLs

Health: GET http://localhost:3000/health

Swagger UI: /docs

Auth

POST /auth/signup

POST /auth/login

GET /auth/me

POST /auth/register — alias por compatibilidade (deprecated no OpenAPI).

Aliases

/api/auth/* é alias de /auth/* e /api/pacientes/* é alias de /pacientes/*

Documentos

OpenAPI: docs/openapi.yaml
Artefatos como coleção do Postman, diagramas e evidências podem ser gerados ao executar o script/CI; não ficam necessariamente versionados no repositório.

