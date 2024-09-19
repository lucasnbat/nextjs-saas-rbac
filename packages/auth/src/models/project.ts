import { z } from "zod"

/* Guarde em models apenas o que vai ser usado para permissionamento */

export const projectSchema = z.object({
    __typename: z.literal('Project').default('Project'), // associar com o subject Project
    id: z.string(),
    ownerId: z.string(),
})

export type Project = z.infer<typeof projectSchema>