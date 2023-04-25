# AlexaSkillsApi
API Rest NodeJS para atebder às minhas skills da Alexa


# Comando criar servidor nodejs
npm init -y ## Cria o package.json

npm i fastify ## Instala o framework fastify para gerenciar as rotas da aplicação

npm i typescript -D ## Instala o typescript

npx tsc --init ## Inicia a configuração do typescript (acessar o arquivo tsconfig.json e mudar o valor da tag "target": "es2016" para "target": "es2020")

npm i tsx -D ## Permite executar arquivos node com typescript sem precisar converter (Ex: npx tsx src/server.ts)

incluir no package.json um script para executar com o tsx e com hot reload: ## "dev": "tsx watch src/server.ts" (para executar, digite no console: npm run dev)

npm i -D prisma ## Instala o framework prisma ORM para gerenciar persistência com banco de dados

npm i @prisma/client ## Acessa o ORM como client

npx prisma init --datasource-provider NOME_DO_DRIVER_DO_BANCO ## Inicia o prisma configurando para o banco informado em NOME_DO_DRIVER_DO_BANCO. (Ex: npx prisma init --datasource-provider postgresql)

npm install dotenv ## Permite acessar as variáveis dentro do arquivo .env

npm i @fastify/cors ## Instala gerenciamento de CORS

npm i zod  ## Valida os dados de requests utilizando objects

npm i dayjs  ## 

### Prisma where with like example:
where: {
    email: {
        contains: "prisma.io"
    }
},