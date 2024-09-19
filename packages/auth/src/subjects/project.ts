import { z } from 'zod'
import { projectSchema } from '../models/project'

export const projectSubject = z.tuple([
    z.union([
        z.literal('create'),
        z.literal('delete'),
        z.literal('manage'),
        z.literal('get'),
        z.literal('update'),
    ]),
    z.union([z.literal('Project'), projectSchema])
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