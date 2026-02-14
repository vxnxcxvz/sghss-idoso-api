# Sistema de Autenticacao - SGHSS

## Visao Geral

Sistema de autenticacao baseado em JWT + bcrypt para o SGHSS.

## Fluxo

1. Usuario envia credenciais para `/api/auth/login`
2. Backend valida com bcrypt
3. Gera token JWT (24h de validade)
4. Cliente usa token em requisicoes: `Authorization: Bearer {token}`

## Endpoints

### POST /api/auth/register
Registra novo usuario.

### POST /api/auth/login
Autentica e retorna token JWT.

### POST /api/auth/logout
Revoga token.

### GET /api/auth/me
Retorna dados do usuario autenticado.

## RBAC

- PACIENTE: Acesso aos proprios dados
- MEDICO: Acesso a pacientes e consultas
- ENFERMEIRO: Acesso a prontuarios
- ADMINISTRADOR: Acesso total

## Logs LGPD

Todas acoes registradas em `logs_auditoria`:
- LOGIN/LOGOUT
- CRIACAO/ATUALIZACAO/EXCLUSAO
- ACESSO a dados sensiveis

## Seguranca

- ✅ Senhas com bcrypt (10 rounds)
- ✅ Tokens JWT com expiracao
- ✅ Revogacao no logout
- ✅ Logs de auditoria
