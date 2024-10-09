import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { createSlug } from '@/http/utils/create-slug'
import { getUserPermissions } from '@/http/utils/get-user-permissions'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const createProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
})

const createProjectSchemaParams = z.object({
  slug: z.string(),
})

type CreateProjectType = z.infer<typeof createProjectSchema>
type CreateProjectParamsType = z.infer<typeof createProjectSchemaParams>

export async function createProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/projects',
      {
        schema: {
          tags: ['projects'],
          summary: 'Create a new project',
          security: [{ bearerAuth: [] }],
          body: createProjectSchema,
          params: createProjectSchemaParams,
          response: {
            201: z.object({
              projectId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params as CreateProjectParamsType
        const { membership, organization } =
          await request.getUserMembership(slug)

        const userId = await request.getCurrentUserId()

        const { cannot } = await getUserPermissions(userId, membership.role)

        if (cannot('create', 'Project')) {
          throw new BadRequestError(
            'You are not allowed to create new projects',
          )
        }

        const { name, description } = request.body as CreateProjectType

        const project = await prisma.project.create({
          data: {
            name,
            description,
            slug: createSlug(name),
            organizationId: organization.id,
            ownerId: userId,
          },
        })

        return reply.status(201).send({
          projectId: project.id,
        })
      },
    )
}
