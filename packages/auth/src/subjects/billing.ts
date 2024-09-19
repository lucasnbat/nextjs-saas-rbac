// é um cálculo, um recurso para fazer permissões
// importante: um subject não necessasriamente é 
// uma tabela do banco ou algo a ser persistido em BD
import { z } from 'zod'

export const billingSubject = z.tuple([
    z.union([
        z.literal('get'),
        z.literal('manage'),
        z.literal('export'),
    ]),
    z.literal('Billing')
])

export type BillingSubject = z.infer<typeof billingSubject>