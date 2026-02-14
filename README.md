# SGHSS VidaPlus — Desenvolvimento Back-end (API REST)

API REST para Plataforma de Suporte ao Cuidado do Idoso (SGHSS VidaPlus), com **Node.js + Express + Prisma + PostgreSQL**, **JWT**, **RBAC** e **auditoria (LGPD)**.

## Como rodar

```bash
npm install
cp .env.example .env
# ajuste DATABASE_URL e JWT_SECRET
npx prisma generate
npx prisma migrate dev
npm run dev
```

URLs

Health: GET http://localhost:3000/health

Swagger UI: http://localhost:3000/docs

Postman

Importe: docs/postman_collection.json
