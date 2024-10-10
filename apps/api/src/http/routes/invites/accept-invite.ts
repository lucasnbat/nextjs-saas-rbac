import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const acceptInviteSchemaParams = z.object({
  inviteId: z.string().uuid(),
})

type AcceptInviteTypeParams = z.infer<typeof acceptInviteSchemaParams>

export async function acceptInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/invites/:inviteId/acc',
      {
        schema: {
          tags: ['invites'],
          summary: 'Accept an invite',
          params: acceptInviteSchemaParams,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { inviteId } = request.params as AcceptInviteTypeParams
        const userId = await request.getCurrentUserId()

        const invite = await prisma.invite.findUnique({
          where: {
            id: inviteId,
          },
        })

        if (!invite) {
          throw new BadRequestError('Invite not found or expired')
        }

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        })

        if (!user) {
          throw new BadRequestError('User not found')
        }

        if (invite.email !== user.email) {
          throw new BadRequestError('Invite belongs to another user')
        }

        await prisma.$transaction([
          prisma.member.create({
            data: {
              userId,
              organizationId: invite.organizationId,
              role: invite.role,
            },
          }),
          prisma.invite.delete({
            where: {
              id: inviteId,
            },
          }),
        ])

        return reply.status(204).send()
      },
    )
}
