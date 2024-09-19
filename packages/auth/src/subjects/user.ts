import { z } from 'zod'

export const userSubject = z.tuple([
    z.union([
        z.literal('delete'),
        z.literal('manage'),
        z.literal('get'),
        z.literal('update'),
    ]),
    z.literal('User')
])

export type UserSubject = z.infer<typeof userSubject>

/**
 * Primeira posição do array: operações permitidas
 * Segunda posição: o nome do subject
 */

// export type UserSubject = [
//     'create' | 'delete' | 'invite' | 'manage',
//     'User'
// ]