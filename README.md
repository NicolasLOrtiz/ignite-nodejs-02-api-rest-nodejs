# Ignite NodeJS - 02 - API REST

Este projeto é uma API RESTful para o controle de finanças (transações), desenvolvida durante a trilha de Node.js do Ignite da Rocketseat.

## 🚀 Tecnologias e Bibliotecas

Abaixo estão as principais tecnologias e bibliotecas utilizadas no projeto e o propósito de cada uma:

- **[Node.js](https://nodejs.org/)**: Ambiente de execução JavaScript/TypeScript backend.
- **[Fastify](https://www.fastify.io/)**: Framework web extremamente rápido e de baixo overhead para Node.js, utilizado para criar e processar as rotas da API HTTP.
- **[@fastify/cookie](https://github.com/fastify/fastify-cookie)**: Plugin para o Fastify que permite criar, ler e gerenciar cookies. Utilizado para gerenciar a autenticação primária (`sessionId`) dos usuários.
- **[Knex.js](https://knexjs.org/)**: Construtor de consultas SQL (Query Builder) utilizado para interagir com o banco de dados e rodar as Migrations de forma programática.
- **[SQLite3](https://github.com/TryGhost/node-sqlite3)**: Banco de dados relacional leve baseado em arquivo. Utilizado exclusivamente no ambiente de desenvolvimento e testes.
- **[Zod](https://zod.dev/)**: Biblioteca de declaração e validação de schemas de dados focada em TypeScript. Utilizada para garantir a tipagem no `request.body`, `request.params` e validar as Variáveis de Ambiente (`.env`).
- **[Vitest](https://vitest.dev/)**: Framework de testes nativo do Vite. Extremamente rápido e perfeitamente integrado ao TypeScript e ao ecossistema moderno.
- **[Supertest](https://github.com/ladjs/supertest)**: Biblioteca que simula requisições HTTP dentro do código sem abrir portas, essencial para os testes End-to-End (E2E) das rotas do Fastify.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática em cima do JavaScript, elevando a segurança contra erros em tempo de execução.
- **[TSX](https://github.com/esbuild-kit/tsx)**: Motor de execução rápida de arquivos `.ts` por baixo dos panos via `esbuild`. Usado em desenvolvimento.
- **[Tsup](https://tsup.egoist.dev/)**: Empacotador para transformar o código TypeScript em JavaScript otimizado (processo de build para produção).
- **[ESLint](https://eslint.org/)** com **[Antfu's Config](https://github.com/antfu/eslint-config)**: Linter padronizado e automatizado que analisa problemas no código e já aplica formatações rígidas, mantendo um padrão limpo e moderno.

## 🛠️ Comandos Disponíveis

Os comandos abaixo podem ser executados através do `npm run <comando>`.

- `dev`: Inicia o servidor de desenvolvimento com *hot-reload* usando `tsx watch src/server.ts`.
- `build`: Cria a versão de produção (compila e empacota o TypeScript) da aplicação na pasta `build`.
- `test`: Roda a suíte completa de testes automatizados E2E através do Vitest.
- `lint`: Inicia a análise e correção estática de código com o ESLint para todo o repositório.
- `knex`: Executa os utilitários de CLI do Knex. Ex: `npm run knex -- migrate:latest` para rodar todas as tabelas, ou `npm run knex -- migrate:rollback` para desfazer.

## 🏗️ Arquitetura do Projeto

O projeto é projetado de forma modular, com as seguintes responsabilidades principais:

- **`src/server.ts`**: É o Entrypoint. Inicializa de fato o servidor HTTP na porta definida (por exemplo: 3333).
- **`src/app.ts`**: Fica com toda a configuração central do Fastify, importação de middlewares globais (como cookie parser) e registro dos arquivos de rotas. Essa separação permite inicializar a "app" limpa durante os testes (sem atrelar a uma porta TCP real).
- **`src/env/index.ts`**: Faz o gerenciamento de configurações. Lê do `.env` e passa pelo Zod para garantir que a aplicação simplesmente nem suba caso faltem chaves cruciais, evitando falhas silenciosas de configuração.
- **`src/database.ts`**: Configura a comunicação base entre o banco de dados (SQLite/Pg) e a aplicação usando o Knex.
- **`src/routes/`**: Separa e lida com cada domínio da aplicação. O arquivo `transactions.ts` é o *controller* responsável por ouvir os Endpoints e ditar como a lógica de acesso será tratada para essa tabela no banco.
- **`src/middlewares/`**: Componentes auxiliares ("funções no meio do caminho"). Por exemplo: o `check-session-id-exists.ts` barra usuários que tentam acessar a rota sem um Cookie válido de identificação (`sessionId`).

## 📡 Documentação das Rotas

Para acessar localmente, a Base URL é: `http://localhost:3333`.

> Todas as rotas de listagem (`GET`) dependem de um cookie válido enviado pelo cabeçalho `Cookie: sessionId=...`. O cookie é criado e enviado automaticamente ao cliente na primeira requisição feita à rota de Criação (`POST`).

### 1. Criar Transação `[POST] /transactions`
Cadastra uma nova transação financeira vinculada à sua "sessão". Cria um Cookie `sessionId` com validade de 7 dias, se ele ainda não existir.

- **Corpo Esperado (JSON):**
  ```json
  {
    "title": "Salário de Janeiro",
    "amount": 5000,
    "type": "credit" // Aceita apenas "credit" (Entrada) ou "debit" (Saída)
  }
  ```

- **Respostas Esperadas:**
  - `201 Created` - Transação adicionada com sucesso.

### 2. Listar Transações `[GET] /transactions`
Lista todo o histórico de transações que pertencem unicamente ao seu Cookie de identificação.

- **Respostas Esperadas:**
  - `200 OK` - Histórico carregado.
  ```json
  {
    "transactions": [
      {
        "id": "e2ba3d11-57de-4933-911e-b8160882e75e",
        "title": "Salário de Janeiro",
        "amount": 5000,
        "session_id": "c1da3d11-57de-4933-911e-b8160882e75e",
        "created_at": "2026-05-17 12:00:00"
      }
    ]
  }
  ```

### 3. Visualizar Transação Única `[GET] /transactions/:id`
Traz as informações exclusivas de apenas um registro referenciado pelo `id` dinâmico na URL.

- **Parâmetros da Rota:** `id` *(UUID da transação)*.

- **Respostas Esperadas:**
  - `200 OK`
  ```json
  {
    "transaction": {
      "id": "e2ba3d11-...",
      "title": "Salário de Janeiro",
      "amount": 5000,
      "session_id": "c1da3d11-...",
      "created_at": "..."
    }
  }
  ```

### 4. Obter Resumo / Saldo `[GET] /transactions/summary`
Calcula o saldo e a visibilidade macro das entradas menos as saídas do seu caixa baseadas no histórico.

- **Respostas Esperadas:**
  - `200 OK`
  ```json
  {
    "summary": {
      "amount": 3500
    }
  }
  ```
