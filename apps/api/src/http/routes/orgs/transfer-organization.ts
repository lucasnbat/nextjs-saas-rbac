import { organizationSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/http/utils/get-user-permissions'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

const transferOrganizationSchema = z.object({
  transferToUserId: z.string().uuid(),
})

const transferOrganizationParamsSchema = z.object({
  slug: z.string(),
})

type UpdateOrganizationType = z.infer<typeof transferOrganizationSchema>
type UpdateOrganizationParamsType = z.infer<
  typeof transferOrganizationParamsSchema
>

export async function transferOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/organizations/:slug/owner',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Transfer organization ownership',
          security: [{ bearerAuth: [] }],
          body: transferOrganizationSchema,
          params: transferOrganizationParamsSchema,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params as UpdateOrganizationParamsType

        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        // vou criar uma empresa seguindo o molde que tá no auth/models!
        const authOrganization = organizationSchema.parse({
          id: organization.id,
          ownerId: organization.ownerId,
        })

        // define as permissões para esse usuário
        // é como se aqui escaneasse para ver qual é a role do authUser e o que ele
        // can (pode) ou cannot (não pode) fazer
        const { cannot } = getUserPermissions(userId, membership.role)

        /* se ele não tem permissão para fazer update nessa organização específica,
         * manda um erro.
         * não cabe usar ('update', 'Organization'), porque assim você estaria dizendo
         * que o usuário não pode alterar nenhuma org, o que é mentira, pois ele pode
         * alterar as organizações onde ele é dono
         */
        if (cannot('transfer_ownership', authOrganization)) {
          throw new UnauthorizedError(
            'You are not allowed to transfer this organization ownership',
          )
        }

        const { transferToUserId } = request.body as UpdateOrganizationType

        const transferToMembership = await prisma.member.findUnique({
          where: {
            organizationId_userId: {
              organizationId: organization.id,
              userId: transferToUserId,
            },
          },
        })

        if (!transferToMembership) {
          throw new BadRequestError(
            'Target user is not a member of this organization',
          )
        }

        // transaction executa as duas querys junto e desfaz se der errado
        await prisma.$transaction([
          prisma.member.update({
            where: {
              organizationId_userId: {
                organizationId: organization.id,
                userId: transferToUserId,
              },
            },
            data: {
              role: 'ADMIN',
            },
          }),
          prisma.organization.update({
            where: { id: organization.id },
            data: { ownerId: transferToUserId },
          }),
        ])

        return reply.status(204).send()
      },
    )
}
