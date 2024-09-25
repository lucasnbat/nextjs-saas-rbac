import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export const ResetPasswordBodySchema = z.object({
  code: z.string(),
  password: z.string().min(6),
})

type ResetPasswordType = z.infer<typeof ResetPasswordBodySchema>

export async function resetPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/reset',
    {
      schema: {
        tags: ['auth'],
        summary: 'Reset password',
        body: ResetPasswordBodySchema,
        response: {
          204: z.null(), // resposta de sucesso sem conteudo
        },
      },
    },
    async (request, reply) => {
      const { code, password } = request.body as ResetPasswordType

      const tokenFromCode = await prisma.token.findUnique({
        where: { id: code },
      })

      if (!tokenFromCode) {
        throw new UnauthorizedError()
      }

      const passwordHash = await hash(password, 6)

      await prisma.user.update({
        where: {
          id: tokenFromCode.userId,
        },
        data: {
          passwordHash,
        },
      })

      return reply.status(204).send()
    },
  )
}
