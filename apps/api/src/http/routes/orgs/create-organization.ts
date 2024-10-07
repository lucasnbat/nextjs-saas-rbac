import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { createSlug } from '@/http/utils/create-slug'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const createOrganizationSchema = z.object({
  name: z.string(),
  domain: z.string().nullish(), // pode vir null ou undefined
  shouldAttachUsersByDomain: z.boolean().optional(),
})

type CreateOrganizationType = z.infer<typeof createOrganizationSchema>

export async function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organization',
      {
        schema: {
          tags: ['organizations'],
          summary: 'Create a new organization',
          security: [{ bearerAuth: [] }],
          body: createOrganizationSchema,
          response: {
            201: z.object({
              organizationId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { name, domain, shouldAttachUsersByDomain } =
          request.body as CreateOrganizationType

        if (domain) {
          const organizationByDomain = await prisma.organization.findUnique({
            where: {
              domain,
            },
          })

          if (organizationByDomain) {
            throw new BadRequestError(
              'Another organization with same domain already exists',
            )
          }
        }

        const organization = await prisma.organization.create({
          data: {
            name,
            slug: createSlug(name),
            domain,
            shouldAttachUsersByDomain,
            ownerId: userId,
            members: {
              create: {
                userId,
                role: 'ADMIN',
              },
            },
          },
        })

        return reply.status(201).send({
          organizationId: organization.id,
        })
      },
    )
}
