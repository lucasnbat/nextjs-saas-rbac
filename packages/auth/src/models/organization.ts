import { z } from "zod"

/* Guarde em models apenas o que vai ser usado para permissionamento */

export const organizationSchema = z.object({
    __typename: z.literal('Organization').default('Organization'), // associar com o subject Organization
    id: z.string(),
    ownerId: z.string(),
})

export type Organization = z.infer<typeof organizationSchema>