import fastifyCors from '@fastify/cors'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

const app = fastify()

/* Permitir qq front end acessar */
app.register(fastifyCors)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running!')
})
