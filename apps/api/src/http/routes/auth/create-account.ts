import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

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
        return reply
          .status(400)
          .send({ message: 'user with same email already exists' })
      }

      const passwordHash = await hash(password, 6)

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      })

      return reply.status(201).send()
    },
  )
}
