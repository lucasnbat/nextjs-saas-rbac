import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { createAccount } from './routes/auth/create-account'

const app = fastify().withTypeProvider<ZodTypeProvider>()

/* Processo de transformação de inputs e outputs */
app.setSerializerCompiler(serializerCompiler)

/* Validação com validador vindo da lib do zod */
app.setValidatorCompiler(validatorCompiler)

/* para criar setup swagger integrada com fastify e zod em JSON */
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

/*  Plugin que pega o JSON gerado e cria uma interface amigável */
app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

/* Permitir qq front end acessar */
app.register(fastifyCors)

/* Rotas */

app.register(createAccount)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running!')
})
