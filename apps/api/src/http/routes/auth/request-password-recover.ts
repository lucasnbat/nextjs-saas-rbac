import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

export const RequestPasswordRecoverBodySchema = z.object({
  email: z.string(),
})

type RequestPasswordRecoverType = z.infer<
  typeof RequestPasswordRecoverBodySchema
>

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/recover',
    {
      schema: {
        tags: ['auth'],
        summary: 'Request a password recovering feature',
        body: RequestPasswordRecoverBodySchema,
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body as RequestPasswordRecoverType

      const userFromEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!userFromEmail) {
        // we dont want peoplo know if user really exists
        return reply.status(201).send()
      }

      // aqui está renomeando o id para 'code'
      const { id: code } = await prisma.token.create({
        data: {
          type: 'PASSWORD_RECOVER',
          userId: userFromEmail.id,
        },
      })

      // enviar link de recover para email (abaixo, simulação apenas para fins
      // de desenvolvimento didático)

      console.log('Recover password token:', code)

      return reply.status(201).send()
    },
  )
}
