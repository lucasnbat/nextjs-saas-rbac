import { roleSchema } from '@saas/auth/src/roles'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/http/utils/get-user-permissions'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const updateMemberSchemaBody = z.object({
  role: roleSchema,
})

const updateMemberSchemaParams = z.object({
  slug: z.string(),
  memberId: z.string().uuid(),
})

type UpdateMemberParamsType = z.infer<typeof updateMemberSchemaParams>
type UpdateMemberSchemaBodyType = z.infer<typeof updateMemberSchemaBody>

export async function updateMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organizations/:slug/members/:memberId',
      {
        schema: {
          tags: ['members'],
          summary: 'Update a member',
          security: [{ bearerAuth: [] }],
          params: updateMemberSchemaParams,
          body: updateMemberSchemaBody,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params as UpdateMemberParamsType
        const { membership, organization } =
          await request.getUserMembership(slug)

        const userId = await request.getCurrentUserId()

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', 'User')) {
          throw new BadRequestError('You are not allowed to update this member')
        }

        const { role } = request.body as UpdateMemberSchemaBodyType

        await prisma.member.update({
          where: {
            id: memberId,
            organizationId: organization.id, // atualizo apenas quem é da minha organização
          },
          data: {
            role,
          },
        })

        return reply.status(204).send()
      },
    )
}
