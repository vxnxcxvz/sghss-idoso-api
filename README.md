# Sistema de Gestão Hospitalar e de Serviços de Saúde (SGHSS)

Projeto do **Sistema de Gestão Hospitalar e de Serviços de Saúde (SGHSS)** desenvolvido para a disciplina de **Projeto Multidisciplinar** do curso de **Análise e Desenvolvimento de Sistemas** da UNINTER.  Este repositório contém exclusivamente a **camada de back‑end**, escrita em Node.js/Express e persistida em PostgreSQL.

O objetivo da aplicação é integrar cadastros de pacientes, profissionais de saúde e agendamentos de consultas, além de permitir o gerenciamento de prontuários eletrônicos, prescrições e módulos administrativos de um hospital ou clínica.  Todos os endpoints foram implementados seguindo o estilo RESTful, com autenticação via JWT e boas práticas de segurança e LGPD.

> **Atenção**: este README se baseia no relatório final do projeto; preencha os campos indicados como `[PENDENTE]` com informações reais do seu código ou forneça os artefatos necessários (diagramas, prints, coleção Postman, etc.) no diretório `docs/` descrito abaixo.

## Tecnologias utilizadas

- **Node.js** (versão 18 ou superior)
- **Express.js** – framework minimalista para APIs REST
- **TypeScript** (se aplicável)  
- **PostgreSQL** – banco de dados relacional
- **JWT / bcrypt** – autenticação e segurança
- **Prisma ou Sequelize** – ORM para acesso ao banco (conforme implementado)
- **Jest / Supertest** – testes unitários e de integração

## Como executar

1. **Clone o repositório** e entre na pasta do projeto:

   ```bash
   git clone https://github.com/vxnxcxvz/sghss-idoso-api.git
   cd sghss-idoso-api
   ```

2. **Instale as dependências**:

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente** criando um arquivo `.env` a partir do modelo `.env.example` (forneça seu host, porta, nome de banco, usuário, senhas, chaves JWT, etc.):

   ```bash
   cp .env.example .env
   # edite .env com seus dados
   ```

4. **Execute as migrações do banco de dados** (ajuste o comando conforme o ORM utilizado – Prisma ou Sequelize):

   ```bash
   npm run migrate
   ```

5. **Inicie a aplicação** em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

   A API deverá estar disponível em `http://localhost:3000` e a documentação (Swagger/OpenAPI) em `http://localhost:3000/api-docs`, se configurada.

## Estrutura de pastas (exemplo)

```
sghss-idoso-api/
├── src/                # Código‑fonte da API (controllers, services, repositories, models)
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── middlewares/
│   ├── routes/
│   └── server.ts       # Arquivo de inicialização do Express
├── docs/               # Documentos de apoio (ver seção Docs abaixo)
│   ├── diagramas/      # Diagramas UML/DER (inserir arquivos .png ou .pdf)
│   ├── postman/        # Coleção e prints dos testes no Postman
│   ├── endpoints/      # Documentação detalhada de cada rota, se não usar Swagger
│   └── relatorio/      # Relatório final em PDF/DOCX
├── .env.example        # Exemplo de variáveis de ambiente
├── package.json        # Dependências e scripts
├── tsconfig.json       # Configurações TypeScript (se usar TS)
└── README.md           # Este arquivo
```

Se o código‑fonte ainda estiver compactado em um arquivo `.zip`, extraia o conteúdo para dentro do diretório `src/` e remova o `.zip` do repositório.  Caso contrário, marque uma pendência para descompactar.

## Endpoints principais

A seguir, uma tabela resumida com os principais endpoints que foram implementados.  **Inclua somente as rotas que você de fato possui em seu código**; ajuste, adicione ou remova conforme necessário.

| Método | Rota                         | Descrição                                   | Autenticação | Códigos HTTP |
|-------:|------------------------------|---------------------------------------------|-------------:|--------------|
| POST   | `/api/v1/auth/login`         | Autentica um usuário e retorna token JWT    | Não          | 200, 401     |
| POST   | `/api/v1/auth/register`      | Cadastra um novo usuário                    | Não          | 201, 400     |
| GET    | `/api/v1/pacientes`          | Lista pacientes (paginado)                  | Sim          | 200, 401     |
| GET    | `/api/v1/pacientes/{id}`     | Obtém detalhes de um paciente               | Sim          | 200, 404     |
| POST   | `/api/v1/pacientes`          | Cria paciente                               | Sim (admin)  | 201, 400     |
| PUT    | `/api/v1/pacientes/{id}`     | Atualiza dados do paciente                  | Sim          | 200, 400     |
| DELETE | `/api/v1/pacientes/{id}`     | Remove paciente (soft delete)               | Sim          | 200, 400     |
| POST   | `/api/v1/consultas`          | Agenda nova consulta                        | Sim          | 201, 400     |
| GET    | `/api/v1/consultas`          | Lista consultas do usuário                  | Sim          | 200, 401     |
| DELETE | `/api/v1/consultas/{id}`     | Cancela consulta                            | Sim          | 200, 400     |
| ...    | ...                          | ...                                         | ...          | ...          |

> **[PENDENTE]** Caso o projeto possua outras rotas (prontuários, prescrições, exames, profissionais, auditoria), adicione‑as aqui com método, URL, descrição, se requer autenticação e os códigos de retorno esperados.

## Docs e evidências

Todo o material adicional do trabalho deve ficar dentro do diretório `docs/` para facilitar a avaliação:

- `docs/diagramas/`: inclua os diagramas de Casos de Uso, Modelo ER e Diagrama de Classes em formato imagem ou PDF.  Use nomes de arquivo claros (ex.: `casos_de_uso.png`, `der.png`, `classes.png`).
- `docs/postman/`: inclua a coleção exportada do Postman (ex.: `collection.json`) e prints das requisições de testes (ex.: `CT01_login.png`, `CT02_criar_paciente.png`).
- `docs/endpoints/`: se a API não tiver documentação Swagger hospedada, crie aqui um arquivo `endpoints.md` detalhando cada rota (método, URL, parâmetros, exemplos de requisição e resposta, códigos de erro). Caso utilize Swagger/OpenAPI, referencie o link da documentação no seu relatório e README.
- `docs/relatorio/`: coloque o relatório final em PDF (por exemplo, `SGHSS_project_report.pdf`) para referência.

Caso ainda não tenha esses materiais, crie um arquivo de texto ou Markdown com a marcação `[PENDENTE]` explicando o que falta fornecer.

## Licença

[LICENÇA PENDENTE] – Defina aqui a licença de uso (ex.: MIT, GPL, Apache) ou remova esta seção se não desejar licenciar publicamente.

## Contribuições

Este projeto foi desenvolvido como trabalho acadêmico e não se encontra aberto a contribuições externas no momento.  Sugestões de melhorias podem ser feitas via issues ou contato direto com o autor.
