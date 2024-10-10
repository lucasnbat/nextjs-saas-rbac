import { roleSchema } from '@saas/auth/src/roles'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { getUserPermissions } from '@/http/utils/get-user-permissions'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

const createInviteSchemaBody = z.object({
  email: z.string().email(),
  role: roleSchema,
})

const createInviteSchemaParams = z.object({
  slug: z.string(),
})

type CreateInviteTypeBody = z.infer<typeof createInviteSchemaBody>
type CreateInviteParamsType = z.infer<typeof createInviteSchemaParams>

export async function createInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/invites',
      {
        schema: {
          tags: ['invites'],
          summary: 'Create a new invite',
          security: [{ bearerAuth: [] }],
          body: createInviteSchemaBody,
          params: createInviteSchemaParams,
          response: {
            201: z.object({
              inviteId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params as CreateInviteParamsType
        const { membership, organization } =
          await request.getUserMembership(slug)

        const userId = await request.getCurrentUserId()

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('create', 'Invite')) {
          throw new BadRequestError('You are not allowed to create new invites')
        }

        const { email, role } = request.body as CreateInviteTypeBody

        const [, domain] = email.split('@')

        if (
          organization.shouldAttachUsersByDomain &&
          organization.domain === domain
        ) {
          throw new BadRequestError(
            `Users with "${domain}" domain will join yout organization automatically on login`,
          )
        }

        const inviteWithSameEmail = await prisma.invite.findUnique({
          where: {
            email_organizationId: {
              email,
              organizationId: organization.id,
            },
          },
        })

        if (inviteWithSameEmail) {
          throw new BadRequestError(
            'Another invite with the same email already exists',
          )
        }

        const memberWithSameEmail = await prisma.member.findFirst({
          where: {
            organizationId: organization.id, // considerando sua org...
            user: {
              email, // bloqueie se já estiver usando um email e enviou convite para o usuario desse email repetidamente
            },
          },
        })

        if (memberWithSameEmail) {
          throw new BadRequestError(
            'A member with this e-mail already belongs to your organization',
          )
        }

        const invite = await prisma.invite.create({
          data: {
            organizationId: organization.id,
            email,
            role,
            authorId: userId,
          },
        })

        return reply.status(201).send({ inviteId: invite.id })
      },
    )
}
