import { organizationSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/http/utils/get-user-permissions'
import { prisma } from '@/lib/prisma'

import { UnauthorizedError } from '../_errors/unauthorized-error'

const shutdownOrganizationParamsSchema = z.object({
  slug: z.string(),
})

type ShutdownOrganizationParamsType = z.infer<
  typeof shutdownOrganizationParamsSchema
>

export async function shutdownOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organizations/:slug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Shutdown organization',
          security: [{ bearerAuth: [] }],
          params: shutdownOrganizationParamsSchema,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params as ShutdownOrganizationParamsType

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
        if (cannot('delete', authOrganization)) {
          throw new UnauthorizedError(
            'You are not allowed to shutdown this organization',
          )
        }

        await prisma.organization.delete({
          where: {
            id: organization.id,
          },
        })

        return reply.status(204).send()
      },
    )
}
