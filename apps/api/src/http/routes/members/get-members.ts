import { roleSchema } from '@saas/auth/src/roles'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/http/utils/get-user-permissions'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const getMembersSchemaParams = z.object({
  slug: z.string(),
})

type GetMembersParamsType = z.infer<typeof getMembersSchemaParams>

export async function getMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/members/',
      {
        schema: {
          tags: ['members'],
          summary: 'List all organization members',
          security: [{ bearerAuth: [] }],
          params: getMembersSchemaParams,
          response: {
            200: z.object({
              members: z.array(
                z.object({
                  id: z.string().uuid(),
                  userId: z.string().uuid(),
                  role: roleSchema,
                  name: z.string().nullable(),
                  avatarUrl: z.string().url().nullable(),
                  email: z.string().email(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params as GetMembersParamsType
        const { membership, organization } =
          await request.getUserMembership(slug)

        const userId = await request.getCurrentUserId()

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'User')) {
          throw new BadRequestError(
            'You are not allowed to see organization members',
          )
        }

        const members = await prisma.member.findMany({
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            organizationId: organization.id,
          },
          orderBy: {
            role: 'asc',
          },
        })

        // pega cada membro, extrai os dados de user separadamente e deixa o resto em ...member
        // veja que ele tambem desestruttura o user para renomear id -> userId e joga o resto em ...user
        const memberWithRoles = members.map(
          ({ user: { id: userId, ...user }, ...member }) => {
            return {
              ...user,
              ...member,
              userId,
            }
          },
        )

        return reply.status(200).send({ members: memberWithRoles })
      },
    )
}
