# Documentação de Endpoints

> **Nota:** Este arquivo serve de referência para a documentação das rotas da API do SGHSS.  Caso a aplicação possua documentação Swagger acessível via `/api-docs`, basta referenciar o link no README e aqui.  Se não houver, documente manualmente cada endpoint (método, rota, parâmetros, exemplo de requisição, exemplo de resposta, códigos de retorno).

## Exemplos de estrutura

### Autenticação

```
POST /api/v1/auth/login

Descrição: Autentica um usuário e retorna um token JWT.
Autenticação: Não requerida

Corpo da requisição (JSON):
{
  "email": "usuario@example.com",
  "senha": "senha123"
}

Respostas possíveis:
- 200 OK – { "accessToken": "...", "refreshToken": "...", "user": { ... } }
- 401 Unauthorized – { "error": "Credenciais inválidas" }
```

### Cadastro de Pacientes

```
POST /api/v1/pacientes

Descrição: Cria um novo paciente.
Autenticação: Requerida (perfil admin)

Corpo da requisição (JSON):
{
  "usuario_id": "uuid-usuario",
  "cpf": "12345678900",
  "nome_completo": "João da Silva",
  "data_nascimento": "1990-01-15",
  "telefone": "(11) 99999-9999",
  "endereco": {
    "rua": "Rua Exemplo",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "uf": "SP",
    "cep": "01000-000"
  }
}

Respostas possíveis:
- 201 Created – { "id": "uuid", "nome_completo": "João da Silva", ... }
- 400 Bad Request – { "error": "Dados inválidos" }
```

---

> **[PENDENTE]** Preencha a documentação das demais rotas (consultas, profissionais, prontuários, prescrições, exames, etc.). Inclua método, rota, descrição, requisitos de autenticação, parâmetros de entrada e de URL, exemplos de JSON de requisição e de resposta, além dos códigos de status HTTP e mensagens de erro.
