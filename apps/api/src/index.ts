import { defineAbilityFor } from '@saas/auth'

const ability = defineAbilityFor({ role: 'MEMBER' })

const userCanInviteSomeoneElse = ability.can('invite', 'User')
const userCanDeleteOtherUsers = ability.can('delete', 'User')
const userCannotDeleteOtherUsers = ability.cannot('delete', 'User')

console.log('Pode convidar:', userCanInviteSomeoneElse)
console.log('Pode deletar usuário?:', userCanDeleteOtherUsers)
console.log('Não pode deletar usuário:', userCannotDeleteOtherUsers)
