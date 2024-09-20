import { defineAbilityFor, projectSchema } from '@saas/auth'

const ability = defineAbilityFor({ role: 'MEMBER', id: 'user-id' })

const project = projectSchema.parse({ id: 'project-id', ownerId: 'user-id' })

/* O usuário pode deletar algum projeto? */
console.log(ability.can('delete', 'Project')) // sim, algum projeto ele pode, desde que seja dele

/* Vamos checar isso... */
console.log(ability.can('delete', project)) // true...se você trocar o ownerId do projeto -> false
