import { defineAbilityFor, userSchema } from '@saas/auth'
import { Role } from '@saas/auth/src/roles'

export function getUserPermissions(userId: string, role: Role) {
  // vou criar um usuário seguindo o molde que tá no auth/models!
  const authUser = userSchema.parse({
    id: userId,
    role,
  })

  // define habilidades do usuário
  const ability = defineAbilityFor(authUser)

  // retorna as habilidades do usuário (can, cannot, etc)
  return ability
}
