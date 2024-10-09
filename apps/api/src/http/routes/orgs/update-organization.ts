import { organizationSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/http/utils/get-user-permissions'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

const updateOrganizationSchema = z.object({
  name: z.string(),
  domain: z.string().nullish(), // pode vir null ou undefined
  shouldAttachUsersByDomain: z.boolean().optional(),
})

const updateOrganizationParamsSchema = z.object({
  slug: z.string(),
})

type UpdateOrganizationType = z.infer<typeof updateOrganizationSchema>
type UpdateOrganizationParamsType = z.infer<
  typeof updateOrganizationParamsSchema
>

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Update organization',
          security: [{ bearerAuth: [] }],
          body: updateOrganizationSchema,
          params: updateOrganizationParamsSchema,
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

        const { name, domain, shouldAttachUsersByDomain } =
          request.body as UpdateOrganizationType

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
        if (cannot('update', authOrganization)) {
          throw new UnauthorizedError(
            'You are not allowed to update this organization',
          )
        }

        if (domain) {
          const organizationByDomain = await prisma.organization.findFirst({
            where: {
              domain, // organização com domínio
              id: {
                not: organization.id, // mas que não seja a organização que o usuário que está atualizando faz parte
              },
            },
          })

          if (organizationByDomain) {
            throw new BadRequestError(
              'Another organization with same domain already exists',
            )
          }
        }

        await prisma.organization.update({
          where: {
            id: organization.id,
          },
          data: {
            name,
            domain,
            shouldAttachUsersByDomain,
          },
        })

        return reply.status(204).send()
      },
    )
}
