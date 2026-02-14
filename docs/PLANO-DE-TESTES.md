# Plano de Testes — SGHSS VidaPlus (escopo entregue)

## Objetivo
Validar o funcionamento mínimo do backend no escopo entregue:
- Auth: /api/auth/register, /api/auth/login, /api/auth/me
- Pacientes: /api/pacientes (GET/POST) — rotas protegidas por token

## Ferramentas
- Postman: `docs/postman_collection.json`
- Swagger: `/docs`

## Critérios de aceite
- Servidor sobe com `npm run dev`
- `/health` retorna 200 com `{ "status": "ok" }`
- Login retorna token válido
- `/me` retorna 200 com token
- `/api/pacientes` sem token retorna 401
- `/api/pacientes` com token retorna 200
- Criar paciente retorna 201

## Evidências obrigatórias
- Prints em `docs/screenshots/` conforme checklist.