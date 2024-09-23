import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const createUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
})

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['auth'], // agregador de rotas pra swagger
        summary: 'Creat a new account | /docs', // descrição para swagger
        body: createUserBodySchema,
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body as CreateUserBodySchema

      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (userWithSameEmail) {
        throw new BadRequestError('user with same email already exists')
      }

      // captura o dominio (lucas@coacen.com -> coacen.com)
      const [, domain] = email.split('@')

      // busca se esse domínio existe já
      const autoJoinOrganization = await prisma.organization.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      })

      const passwordHash = await hash(password, 6)

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          // se domínio existe, cria relação de user com a org. na tabela members
          member_on: autoJoinOrganization
            ? {
                create: {
                  organizationId: autoJoinOrganization.id,
                },
              }
            : undefined,
        },
      })

      return reply.status(201).send()
    },
  )
}
