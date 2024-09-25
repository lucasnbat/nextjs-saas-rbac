# Visão geral do Next.js

## História

* Problema original dos SPAs:
  
  * Indexação (SEO);

* Tradicional SPA:

<img src="file:///C:/Users/lucas/AppData/Roaming/marktext/images/2024-09-17-15-45-01-image.png" title="" alt="" data-align="center">

* O problema dessa arquitetura acima é o SEO:   
  
  * Os robôs do google que vão categorizar muitas vezes *não esperam seu front carregar todo o js para mandar requisições ao back e mostrar o conteúdo final em tela* (problemas de timeout deles);
  
  * Logo, sempre existe a chance do robô categorizar seu site considerando apenas partes dele e indexar ele mal no google, nos resultados;

* Next (SSR - Server Side Rendering):

<img src="file:///C:/Users/lucas/AppData/Roaming/marktext/images/2024-09-17-15-49-58-image.png" title="" alt="" data-align="center">

* Nós temos um servidor nextjs em node que vai fazer as reqs para o backend, pegar o resultado, montar a pagina HTML (renderizar), isso tudo **do lado do servidor** e depois enviar isso para o front
  
  * Dessa forma, o frontend não vai carregar parte de codigo html, depois esperar codigo js com resposta retornar do back para completar a pintura;
  
  * Ele vai ficar em estado de aguardando o servidor até **TUDO ESTAR RENDERIZADO**;
    
    * E isso vai melhorar a análise para o robô e salvar o seu SEO;

* Static Site Generation(SSG):
  
  * Portal de notícias;

<img src="file:///C:/Users/lucas/AppData/Roaming/marktext/images/2024-09-17-15-55-34-image.png" title="" alt="" data-align="center">

* Essa funcionalidade **SSG** permite fazer um cache de resultado de pagina renderizada por x tempo;
  
  * Dessa forma, se você tem muitos acessos num site de notícias, pode determinar que a página estática gerada será atualizada apenas de 10 em 10 minutos;
  
  * Então quando alguém entrar no site, você não vai precisar fazer todo o caminho (ir no back, pegar requisição, montar html, retornar html). Você só vai retornar a página em cachê mais recente;
  
  * Caso já tenha passado 10 minutos, aí o processo é refeito para atualizar a versão da página guardada em cachê;

# Mono-repo + setup Eslint/ Prettier

* Conceito de manter front e backend num único repositório;

* Não significa necessariamente você ter front e back junto, é apenas uma organização de pastas;

* Turborepo: ferramenta que acelera processos do monorepo;
  
  * Comandos de build apenas para certas partes do código (ex: se eu alterei apenas o front, ele builda apenas o front);
  
  * Administração de scripts;
  
  * Criação de cache para otimizações;

* Criando um novo repo:

* ```powershell
  pnpm dlx create-turbo@latest
  ```

* Vai pedir nome do projeto...defina um da sua preferência;

* Entre na pasta do projeto e entre no vscode;

* Fui em cada uma das dependências:
  
  <img title="" src="file:///C:/Users/lucas/AppData/Roaming/marktext/images/2024-09-18-08-25-40-image.png" alt="" data-align="center" width="355">

* E dentro delas troquei de `@repo` para `@saas`. Sim, você pode trocar para o nome da sua aplicação desde que troque na raiz (`package.json` da raiz do projeto) também;

* `eslint-config/package.json`:

* ```vim
  {
    "name": "@saas/eslint-config",
    "version": "0.0.0",
    "private": true,
    "files": [
      "library.js",
      "next.js",
      "react-internal.js"
    ],
    "devDependencies": {
      "@vercel/style-guide": "^5.2.0",
      "eslint-config-turbo": "^2.0.0",
      "eslint-config-prettier": "^9.1.0",
      "eslint-plugin-only-warn": "^1.1.0",
      "@typescript-eslint/parser": "^7.1.0",
      "@typescript-eslint/eslint-plugin": "^7.1.0",
      "typescript": "^5.3.3"
    }
  }
  ```

* `typescript-config/package.json`: 

* ```vim
  {
    "name": "@saas/typescript-config",
    "version": "0.0.0",
    "private": true,
    "license": "MIT",
    "publishConfig": {
      "access": "public"
    }
  }
  ```

* Se houverem essas dependências abaixo, troque de `@repo` para `@nomeDoSeuApp`também:
  
  <img src="file:///C:/Users/lucas/AppData/Roaming/marktext/images/2024-09-18-08-30-39-image.png" title="" alt="" data-align="center">

* Execute `pnpm install` sempre que mudar os @ para que o gerenciador leia novamente os pacotes e aponte algo de errado caso exista;

* Seguindo, vamos eliminar os pacotes typescript e eslint do `package.json` da raiz:

* ```vim
  {
    "name": "next-saas-rbac",
    "private": true,
    "scripts": {
      "build": "turbo build",
      "dev": "turbo dev",
      "lint": "turbo lint"
    },
    "devDependencies": {
      "turbo": "^2.1.2"
    },
    "packageManager": "pnpm@8.15.6",
    "engines": {
      "node": ">=18"
    }
  }
  ```

* Agora, movemos as pastas `typescript-config/`  e `eslint-config/` para a nova pasta `config/` que criamos;

* Depois, crie uma pasta`prettier` e crie um pacote `package.json` nela:

* ```vim
  {
      "name": "@saas/prettier",
      "version": "0.0.0",
      "main": "index.mjs",
      "private": true
  }
  ```

* Basicamente:
  
  * Version pode ser qualquer uma, pois ao instalar prettier, vamos jogar * , e o computador vai entender que deve pegar qualquer mais recente;
  
  * Main: indica o arquivo main que tem as config que serão importadas. Pode criar um `index.mjs` (ec modules) na pasta `config/prettier/` para isso;
  
  * Private: indica que é um pacote privado nosso que não será publicado no npm;

* Entre na pasta do prettier no terminal e execute: 

* ```vim
  pnpm install -D prettier
  pnpm install prettier-plugin-tailwindcss -D
  ```

* Configs no `index.mjs`:

* ```vim
  /** @typedef {import('prettier').Config} PrettierConfig */ //importa tipagem do prettier
  
  /** @type { PrettierConfig } */
  
  const config = {
      plugins: ['prettier-plugin-tailwindcss'],
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: false,
      singleQuote: true,
      quoteProps: 'as-needed',
      jsxSingleQuote: false,
      trailingComma: 'es5',
      bracketSpacing: true,
      arrowParens: 'always',
      endOfLine: 'auto',
      bracketSameLine: false,
  }
  
  export default config
  ```

* Vá para a pasta `config/eslint-config/` e elimine as dependencias de dev:

* ```vim
  {
    "name": "@saas/eslint-config",
    "version": "0.0.0",
    "private": true,
    "files": [
      "library.js",
      "next.js",
      "react-internal.js"
    ],
    "devDependencies": {
      "@rocketseat/eslint-config": "^2.2.2"
    }
  }
  ```

* Entre na pasta `eslint-config` no terminal e execute:

* ```vim
  pnpm i
  pnpm i @rockeseat/eslint-config -D
  pnpm i eslint-plugin-simple-import-sort -D
  ```

* O primeiro comando vai desinstalar as dependencias antigas e o segundo vai instalar o padrão eslint da rocketseat;

* O terceiro irá instalar o plugin de ordenação de imports;

* Agora, você vai importar o pacote `@saas/prettier` que criou para uso interno nesse repo:
  
  ```vim
  {
    "name": "@saas/eslint-config",
    "version": "0.0.0",
    "private": true,
    "files": [
      "library.js",
      "next.js",
      "react-internal.js"
    ],
    "devDependencies": {
      "@rocketseat/eslint-config": "^2.2.2",
      "eslint-plugin-simple-import-sort": "^12.1.1",
      "@saas/prettier": "workspace:*"
    },
    "prettier": "@saas/prettier",
    "eslint-config": {
      "extends": ["./library.js"]
    }
  }
  ```

* Após isso,  execute o `pnpm i`

* Agora você pode ver que a dep. consta no node_modules do `eslint-config/`<img src="file:///C:/Users/lucas/AppData/Roaming/marktext/images/2024-09-18-10-07-14-image.png" title="" alt="" data-align="center">

* Elimine os arquivos de `typescript-config/` e deixe o `tsconfig.json` assim:

* ```vim
  {
    "name": "@saas/ts-config",
    "version": "0.0.0",
    "private": true,
    "license": "MIT",
    "publishConfig": {
      "access": "public"
    }
  }
  ```

# SaaS multi-tenant & RBAC

## Single Tenant vs Multi Tenant

* Single Tenant: uma instância software usada por uma empresa;
  
  * Se você tem mais de uma empresa, tem que copiar uma nova instância do software para outra empresa usar;
  
  * A empresa tem um servidor com um software rodando na infra dela;

* Multi Tenant: o software roda numa infra da nuvem e varias empresas acessam desse lugar;

* **Multi Tenant NÃO QUER DIZER multi subdomínios**. Você não é refém de identificar o usuário e a empresa dele só por subdomínios (empresa1.app.com, empresa2.app.com).
  
  * Você pode simplemente salvar a empresa do usuário numa tabela com id e associar a ele;

* Ex: Stripe (multi-tenant);

* **Multi tenant NÃO PRECISA DE UM BANCO OU SCHEMA POR EMPRESA**;
  
  * Você resolve isso tendo um único schema contendo foreign key indicando de qual empresa é o dado;
  
  * Exceções:
    
    * Vender para o governo;
    
    * Vender com contrato individual especificando que não querem os dados em conjunto com outras empresas;

### Autorização

* RBAC: ROle based Authorization Control: controle baseado em cargos;
  
  * Mais geral, alto nível (membro pode alterar projetos, pode listar projetos)

* ABAC: Attribute Based Authorization COntrol: baseado em atributos;
  
  * Granular, o membro pode alterar o título do projeto, pode listar projetos apenas com detalhes gerais;

* Usuário deveria poder criar Novas Roles?
  
  * 90% das vezes não;
  
  * Casos em que precisa é quando há muitos detalhes e preciso de permissionamento muito granular;

* Assumindo que o usuário não cria novas roles, podemos ter a seguinte esquematização:

<img title="" src="file:///C:/Users/lucas/AppData/Roaming/marktext/images/2024-09-18-10-59-44-image.png" alt="" data-align="center" width="411">

# Criando pacote de autenticação

* Tudo que é compartilhado entre front e back no contexto de monorepo, se torna um **pacote (package)** ou, se é configuração, uma **config**

* Como eu configuro um pacote da aplicação?
  
  * Bom, tem muito do que já vimos.

* Crie a pasta `packages/auth/` e depois, crie os arquivos `package.json` e `index.ts`.

* No `package.json`:

* ```vim
  {
      "name": "@saas/auth",
      "version": "0.0.0",
      "private": true,
      "main": "index.ts",
      "types": "index.ts"
  }
  ```

* Estamos nomeando o pacote com "name", definindo-o como privado e apontando que o arquivo a ser carregado na importação desse pacote é o index.ts, além de que qualquer tipagem deve vir do `index.ts` também;

* Insira as dependências em `packages/auth/package.json`:

* ```vim
      "devDependencies": {
          "@saas/prettier": "workspace:*",
          "@saas/eslint-config": "workspace:*",
          "@saas/typescript-config": "workspace:*"
      }
  ```

* Adicione também as depedencias do eslint e prettier:

* ```vim
  {
      "name": "@saas/auth",
      "version": "0.0.0",
      "private": true,
      "main": "index.ts",
      "types": "index.ts",
      "devDependencies": {
          "@saas/prettier": "workspace:*",
          "@saas/eslint-config": "workspace:*",
          "@saas/typescript-config": "workspace:*"
      },
      "eslintConfig": {
          "extends": [
              "@saas/eslint/config/library"
          ]
      },
      "prettier": "@saas/prettier"
  }
  ```

* O código de configuração de tipagem para bibliotecas presente em `config/typescript-config/library.json` foi tirado de um repositorio `tsconfig/bases` do github, na parte de Vite React;

* ```vim
  {
      "$schema": "https://json.schemastore.org/tsconfig",
      "_version": "3.0.0",
      "compilerOptions": {
          "target": "ES2020",
          "useDefineForClassFields": true,
          "lib": [
              "ES2020",
              "DOM",
              "DOM.Iterable"
          ],
          "module": "ESNext",
          "skipLibCheck": true,
          "moduleResolution": "bundler",
          "allowImportingTsExtensions": true,
          "resolveJsonModule": true,
          "isolatedModules": true,
          "noEmit": true,
          "jsx": "react-jsx",
          "strict": true,
          "noUnusedLocals": true,
          "noUnusedParameters": true,
          "noFallthroughCasesInSwitch": true
      }
  }
  ```

* Como funcionam todos esses pacotes então?
  
  * Bem, vemos que há um padrão:
    
    * `package.json` sempre fica com os meta dados do pacote, devDependencies ou outras bibliotecas anexadas (no caso do eslint, por ex, temos o prettier anexado no package)
    
    * `index.*` são arquivos que vão conter as configurações em si para trabalhar com os pacotes;

# CASL - Biblioteca de autenticação

* User Action: descreve o que usuário pode ou não fazer;
  
  * Ex: create, read, update, delete;

* Subject: entidades da aplicação (Payslip, User, etc);

* Fields: campos das entidades que quero a associar ermissão condicional;

* Condições: condições como "usuário só pode editar um tweet criado se ninguém deu like ainda";

* No geral, é bom ter as regras de negócio de condições de autenticação dentro da sua aplicação, no backend; então:
  
  * Condições gerais: guardadas no CASL;
  
  * Condições beirando a linha de regra de negócio: guardadas no Back-end;

* Por padrão, o CASL deixa tudo como acesso negado. Nós seguimos apenas dizendo o que pode fazer;

* Começando: coloque o código de exemplo no `src/index.ts`:

* ```vim
  import { createMongoAbility, ForcedSubject, CreateAbility, MongoAbility } from '@casl/ability';
  
  const actions = ['manage', 'invite'] as const;
  const subjects = ['User', 'all'] as const;
  type AppAbilities = [
    typeof actions[number],
    typeof subjects[number] | ForcedSubject<Exclude<typeof subjects[number], 'all'>>
  ];
  
  export type AppAbility = MongoAbility<AppAbilities>;
  export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;
  ```

* Instale o @casl/ability

* ```powershell
  pnpm i @casl/ability
  ```

* Começamos a configuração em `/apps/api/package.json`:

* ```vim
  {
      "name": "@saas/api",
      "version": "1.0.0",
      "devDependencies": {
          "@saas/prettier": "workspace:*",
          "@saas/eslint-config": "workspace:*",
          "@saas/typescript-config": "workspace:*"
      },
      "prettier": "@saas/prettier",
      "eslintConfig": {
          "extends": [
              "@saas/eslint-config/node"
          ]
      }
  }
  ```

* Faça o `pnpm install` e siga:

* ```powershell
  pnpm i @types/node tsx -D
  ```

# Requisitos/ features

This project contains all the necessary boilerplate to setup a multi-tenant SaaS with Next.js including authentication and RBAC authorization.

## Features

### Authentication

- [ ] It should be able to authenticate using e-mail & password;
- [ ] It should be able to authenticate using Github account;
- [ ] It should be able to recover password using e-mail;
- [ ] It should be able to create an account (e-mail, name and password);

### Organizations

- [ ] It should be able to create a new organization;
- [ ] It should be able to get organizations to which the user belongs;
- [ ] It should be able to update an organization;
- [ ] It should be able to shutdown an organization;
- [ ] It should be able to transfer organization ownership;

### Invites

- [ ] It should be able to invite a new member (e-mail, role);
- [ ] It should be able to accept an invite;
- [ ] It should be able to revoke a pending invite;

### Members

- [ ] It should be able to get organization members;
- [ ] It should be able to update a member role;

### Projects

- [ ] It should be able to get projects within a organization;
- [ ] It should be able to create a new project (name, url, description);
- [ ] It should be able to update a project (name, url, description);
- [ ] It should be able to delete a project;

### Billing

- [ ] It should be able to get billing details for organization ($20 per project / $10 per member excluding billing role);

## RBAC

Roles & permissions.

### Roles

- Owner (count as administrator)
- Administrator
- Member
- Billing (one per organization)
- Anonymous

### Permissions table

|                        | Administrator | Member | Billing | Anonymous |
| ---------------------- | ------------- | ------ | ------- | --------- |
| Update organization    | ✅             | ❌      | ❌       | ❌         |
| Delete organization    | ✅             | ❌      | ❌       | ❌         |
| Invite a member        | ✅             | ❌      | ❌       | ❌         |
| Revoke an invite       | ✅             | ❌      | ❌       | ❌         |
| List members           | ✅             | ✅      | ✅       | ❌         |
| Transfer ownership     | ⚠️             | ❌      | ❌       | ❌         |
| Update member role     | ✅             | ❌      | ❌       | ❌         |
| Delete member          | ✅             | ⚠️      | ❌       | ❌         |
| List projects          | ✅             | ✅      | ✅       | ❌         |
| Create a new project   | ✅             | ✅      | ❌       | ❌         |
| Update a project       | ✅             | ⚠️      | ❌       | ❌         |
| Delete a project       | ✅             | ⚠️      | ❌       | ❌         |
| Get billing details    | ✅             | ❌      | ✅       | ❌         |
| Export billing details | ✅             | ❌      | ✅       | ❌         |

> ✅ = allowed
> ❌ = not allowed
> ⚠️ = allowed w/ conditions

#### Conditions

- Only owners may transfer organization ownership;
- Only administrators and project authors may update/delete the project;
- Members can leave their own organization;

# Iniciando: setup com fastify

* Módulos instalados:

* ```powershell
  pnpm i fastify fastify-type-provider-zod @fastify/cors zod
  ```

* Como fazer requisições http no powershell:

* ```powershell
  Invoke-WebRequest -Uri "http://localhost:3333/users" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"name": "sample", "email": "sample@sample.com", "password": "123123"}'
  ```

* Como iniar config. do prisma:

* ```powershell
  pnpm install prisma -D
  pnpm prisma init
  ```

* Como configurar o @/ como caminho absoluto para imports:

* ```powershell
  {
      "extends": "@saas/typescript-config/node.json",
      "include": [
          "src/**/*"
      ],
      "compilerOptions": {
          "baseUrl": ".",
          "paths": {
              "@/*": [
                  "./src/*"
              ]
          }
      }
  }
  ```



# Anotações durante construção

* Como criar um seed?

* Instale o faker:

* ```powershell
  pnpm i @faker-js/faker -D
  ```

* Após criar o `seed.ts`, crie uma seção chamada "prisma" e coloque o script:

* ```powershell
      "prisma":{
          "seed":"tsx prisma/seed.ts"
      },
  ```

* Script para ativar e popular o banco:

* ```powershell
  pnpm dlx prisma db seed
  ```
# Setup Swagger

* Instale com: 
```powershell
pnpm i @fastify/swagger
```

* Adicione esse plugin no seu `server.ts`: 
```vim
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Next.js SaaS',
      description: 'Full-stack SaaS app with multi-tenant & RBAC',
      version: '1.0.0',
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
})
```
* Lembre de descomentar o `jsonSchemaTransform`
* Para visualizar: `pnpm i @fastify/swagger-ui` 
* Adicione o plugin no `server.ts`:
```vim
app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})
```
* Assim, ao acessar o /docs, você irá para a documentação

# Fastify JWT

```vim
pnpm i @fastify/jwt
```

```vim
app.register(fastifyJwt, {
  secret: 'sua-secret-aqui',
})
```
## Extendendo classes no fastify

* Crie um arquivo `/api/@types/fastify.d.ts`:
```vim
import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
  }
}

```
* Lembre de conferir se no `tsconfig.json` você tem o @types como fonte de tipos:
```vim
{
    "extends": "@saas/typescript-config/node.json",
    "include": [
        "src/**/*",
        "@types"
    ],
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": [
                "./src/*"
            ]
        }
    }
}
```
* Tudo isso é feito para ser possível usar essa função `getCurrentUserId` asspcia-
  da à request:
```vim
export async function auth(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()

        return sub
      } catch (error) {
        throw new UnauthorizedError('Invalid auth token')
      }
    }
  })
}
```
* Mesmo assim, você precisa instalar o fastify-plugin para disponibilizar esse
  hook para toda a aplicação;

```powershell
pnpm install fastify-plugin
```
* Agora reescreva o middleware como arrow function e pegue o conteudo para inserir
  dentro da função `fastifyplugin`:

```vim

import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

import { UnauthorizedError } from '../routes/_errors/unauthorized-error'

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()

        return sub
      } catch (error) {
        throw new UnauthorizedError('Invalid auth token')
      }
    }
  })
})
```
* você sempre precisará usar o `fastifyPlugin` para expor o seu hook/plugin
  para a aplicação inteira;  