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

Swagger UI: http://localhost:3000/docs

Auth

POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

Documentos

OpenAPI: docs/openapi.yaml

Postman: docs/postman_collection.json

Diagramas: docs/diagramas/

Evidências: docs/screenshots/
