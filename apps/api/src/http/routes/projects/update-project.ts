import { projectSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/http/utils/get-user-permissions'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

const updateProjectBodySchema = z.object({
  name: z.string(),
  description: z.string(),
})

const updateProjectSchemaParams = z.object({
  slug: z.string(),
  projectId: z.string().uuid(),
})

type UpdateProjectParamsType = z.infer<typeof updateProjectSchemaParams>
type UpdateProjectBodyType = z.infer<typeof updateProjectBodySchema>

export async function updateProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organizations/:slug/projects/:projectId',
      {
        schema: {
          tags: ['projects'],
          summary: 'Update an project',
          security: [{ bearerAuth: [] }],
          params: updateProjectSchemaParams,
          body: updateProjectBodySchema,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, projectId } = request.params as UpdateProjectParamsType
        const { membership, organization } =
          await request.getUserMembership(slug)

        const userId = await request.getCurrentUserId()

        const project = await prisma.project.findUnique({
          where: {
            id: projectId,
            organizationId: organization.id,
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found')
        }

        const { cannot } = getUserPermissions(userId, membership.role)

        const authProject = projectSchema.parse(project)

        if (cannot('update', authProject)) {
          throw new UnauthorizedError(
            'You are not allowed to update this project',
          )
        }

        const { description, name } = request.body as UpdateProjectBodyType

        await prisma.project.update({
          where: {
            id: projectId,
          },
          data: {
            description,
            name,
          },
        })

        return reply.status(204).send()
      },
    )
}
