import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'

const getOrganizationSchema = z.object({
  slug: z.string(),
})

type GetOrganizationType = z.infer<typeof getOrganizationSchema>

export async function getOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Get details from organization',
          security: [{ bearerAuth: [] }],
          body: getOrganizationSchema,
          response: {
            // 201: z.object({
            //   organizationId: z.string().uuid(),
            // }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params as GetOrganizationType
      },
    )
}
