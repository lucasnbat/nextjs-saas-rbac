import fastifyCors from '@fastify/cors'
import { fastify } from 'fastify'
import {
  // jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

const app = fastify().withTypeProvider<ZodTypeProvider>()

/* Processo de transformação de inputs e outputs */
app.setSerializerCompiler(serializerCompiler)

/* Validação com validador vindo da lib do zod */
app.setValidatorCompiler(validatorCompiler)

/* Permitir qq front end acessar */
app.register(fastifyCors)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running!')
})
