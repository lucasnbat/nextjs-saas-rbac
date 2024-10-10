import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { env } from '@saas/env'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from './error-handler'
import { authenticateWithGithub } from './routes/auth/authenticate-with-github'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password'
import { createAccount } from './routes/auth/create-account'
import { getProfile } from './routes/auth/get-profile'
import { requestPasswordRecover } from './routes/auth/request-password-recover'
import { resetPassword } from './routes/auth/reset-password'
import { acceptInvite } from './routes/invites/accept-invite'
import { createInvite } from './routes/invites/create-invite'
import { getInvite } from './routes/invites/get-invite'
import { getInvites } from './routes/invites/get-invites'
import { getMembers } from './routes/members/get-members'
import { removeMember } from './routes/members/remove-member'
import { updateMember } from './routes/members/update-member'
import { createOrganization } from './routes/orgs/create-organization'
import { getMembership } from './routes/orgs/get-membership'
import { getOrganization } from './routes/orgs/get-organization'
import { getOrganizations } from './routes/orgs/get-organizations'
import { shutdownOrganization } from './routes/orgs/shutdown-organization'
import { transferOrganization } from './routes/orgs/transfer-organization'
import { updateOrganization } from './routes/orgs/update-organization'
import { createProject } from './routes/projects/create-project'
import { deleteProject } from './routes/projects/delete-project'
import { getProject } from './routes/projects/get-project'
import { getProjects } from './routes/projects/get-projects'
import { updateProject } from './routes/projects/update-project'

const app = fastify().withTypeProvider<ZodTypeProvider>()

/* Processo de transformação de inputs e outputs */
app.setSerializerCompiler(serializerCompiler)

/* Validação com validador vindo da lib do zod */
app.setValidatorCompiler(validatorCompiler)

/* instancia o error handler */
app.setErrorHandler(errorHandler)

/* para criar setup swagger integrada com fastify e zod em JSON */
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Next.js SaaS',
      description: 'Full-stack SaaS app with multi-tenant & RBAC',
      version: '1.0.0',
    },
    // config. para aparecer o botão "authorize" no swagger
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

/*  Plugin que pega o JSON gerado e cria uma interface amigável */
app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

/* Permitir qq front end acessar */
app.register(fastifyCors)

/* Rotas */

/* Autenticação, perfil */
app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getProfile)
app.register(requestPasswordRecover)
app.register(resetPassword)
app.register(authenticateWithGithub)

/* Organizations */
app.register(createOrganization)
app.register(getMembership)
app.register(getOrganization)
app.register(getOrganizations)
app.register(updateOrganization)
app.register(shutdownOrganization)
app.register(transferOrganization)

/* Projects */
app.register(createProject)
app.register(deleteProject)
app.register(getProject)
app.register(getProjects)
app.register(updateProject)
app.register(getMembers)
app.register(updateMember)
app.register(removeMember)

/* Invites */
app.register(createInvite)
app.register(getInvite)
app.register(getInvites)
app.register(acceptInvite)

app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log('HTTP server running!')
})
