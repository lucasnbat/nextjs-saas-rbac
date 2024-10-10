import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/http/utils/get-user-permissions'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const removeMemberSchemaParams = z.object({
  slug: z.string(),
  memberId: z.string().uuid(),
})

type RemoveMemberParamsType = z.infer<typeof removeMemberSchemaParams>

export async function removeMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organizations/:slug/members/:memberId',
      {
        schema: {
          tags: ['members'],
          summary: 'Remove an member from the organization',
          security: [{ bearerAuth: [] }],
          params: removeMemberSchemaParams,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params as RemoveMemberParamsType
        const { membership, organization } =
          await request.getUserMembership(slug)

        const userId = await request.getCurrentUserId()

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', 'User')) {
          throw new BadRequestError(
            'You are not allowed to remove this member from organization',
          )
        }

        await prisma.member.delete({
          where: {
            id: memberId,
            organizationId: organization.id, // removo apenas quem é da minha organização
          },
        })

        return reply.status(204).send()
      },
    )
}
