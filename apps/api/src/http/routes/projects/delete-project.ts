import { projectSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/http/utils/get-user-permissions'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

const deleteProjectSchemaParams = z.object({
  slug: z.string(),
  projectId: z.string().uuid(),
})

type DeleteProjectParamsType = z.infer<typeof deleteProjectSchemaParams>

export async function deleteProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organizations/:slug/projects/:projectId',
      {
        schema: {
          tags: ['projects'],
          summary: 'Delete an project',
          security: [{ bearerAuth: [] }],
          params: deleteProjectSchemaParams,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, projectId } = request.params as DeleteProjectParamsType
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

        if (cannot('delete', authProject)) {
          throw new UnauthorizedError(
            'You are not allowed to delete this project',
          )
        }

        await prisma.project.delete({
          where: {
            id: projectId,
          },
        })

        return reply.status(204).send()
      },
    )
}
