import { z } from 'zod'

export const projectSubject = z.tuple([
    z.union([
        z.literal('create'),
        z.literal('delete'),
        z.literal('manage'),
        z.literal('get'),
        z.literal('update'),
    ]),
    z.literal('Project')
])

export type ProjectSubject = z.infer<typeof projectSubject>

/**
 * Primeira posição do array: operações permitidas
 * Segunda posição: o nome do subject
 */

// export type ProjectSubject = [
//     'create' | 'delete' | 'manage',
//     'Project'
// ]