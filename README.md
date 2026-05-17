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
- **[@fastify/swagger](https://github.com/fastify/fastify-swagger)** e **[@scalar/fastify-api-reference](https://github.com/scalar/scalar/tree/main/packages/fastify-api-reference)**: Geração automática da especificação OpenAPI e interface interativa visual moderna para testes e visualização da API (substituindo ferramentas como o Insomnia).
- **[fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod)**: Integração nativa do Zod ao ciclo de vida do Fastify, tipando as rotas automaticamente e unindo as validações diretamente à geração da documentação Swagger.
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

## 📡 Documentação Interativa da API (Scalar)

Esqueça a necessidade de importar arquivos no Insomnia ou Postman. A documentação desta API é **viva**, tipada e renderizada diretamente no seu navegador, alimentada automaticamente pelos schemas do Zod.

Para acessar a documentação visual e o cliente de testes interativo localmente:

1. Inicie o servidor (`npm run dev`).
2. Abra o navegador no endereço: **[http://localhost:3333/docs](http://localhost:3333/docs)**

Lá você encontrará a interface do **Scalar**, que descreve perfeitamente as rotas:
- **`[POST] /transactions`** (Criar Transação)
- **`[GET] /transactions`** (Listar Histórico)
- **`[GET] /transactions/:id`** (Buscar transação exclusiva)
- **`[GET] /transactions/summary`** (Obter o saldo)

> 💡 **Dica de uso:** Ao realizar o teste da rota `POST` diretamente pela página do Scalar, você já recebe o `id` da transação gerada na resposta. Basta copiá-lo para testar a rota exclusiva de `GET /:id` na sequência. As requisições `GET` dependem do Cookie (`sessionId`) que é enviado de forma automatizada pelo navegador (ou cliente) no momento em que você faz o primeiro `POST`.
