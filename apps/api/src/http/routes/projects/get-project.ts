import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/http/utils/get-user-permissions'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const getProjectSchemaParams = z.object({
  orgSlug: z.string(),
  projectSlug: z.string(),
})

type GetProjectParamsType = z.infer<typeof getProjectSchemaParams>

export async function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:orgSlug/projects/:projectSlug',
      {
        schema: {
          tags: ['projects'],
          summary: 'List an project',
          security: [{ bearerAuth: [] }],
          params: getProjectSchemaParams,
          response: {
            200: z.object({
              id: z.string().uuid(),
              name: z.string(),
              description: z.string(),
              slug: z.string(),
              ownerId: z.string().uuid(),
              avatarUrl: z.string().url().nullable(),
              organizationId: z.string().uuid(),
              owner: z.object({
                id: z.string(),
                name: z.string().nullable(),
                avatarUrl: z.string().url().nullable(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { orgSlug, projectSlug } = request.params as GetProjectParamsType
        const { membership, organization } =
          await request.getUserMembership(orgSlug)

        const userId = await request.getCurrentUserId()

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Project')) {
          throw new BadRequestError('You are not allowed to see this project')
        }

        const project = await prisma.project.findUnique({
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            ownerId: true,
            avatarUrl: true,
            organizationId: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            slug: projectSlug,
            organizationId: organization.id,
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found')
        }

        return reply.status(201).send({
          project,
        })
      },
    )
}
