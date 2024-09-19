import { AbilityBuilder } from "@casl/ability"
import { AppAbility } from "."

type Role = 'ADMIN' | 'MEMBER'

// note que aqui eu uso o AbilityBuilder, o mesmo que usei para criar as permissões
// específicas no src/index.ts. 
// Além disso, passo o generic AppAbility que carrega todo o conjunto de ações e sujeitos
// bem como regras gerais que são inicialmente setadas no AppAbilities e passadas 
// para o MongoAbility<>
// no fim das contas, o builder está fazendo o trabalho de disponibilizar o can, cannot
// e build para nós
type PermissionsByRole = (user: any, builder: AbilityBuilder<AppAbility>) => void

export const permissions: Record<Role, PermissionsByRole> = {
    // aqui eu desestruturo o resultado de builder e pego o { can }
    // estrutura original:
    /*
     * ADMIN(_, builder) {
     *  can('manage', 'all')
     * },
     */
    ADMIN(_, { can }) {
        can('manage', 'all')
    },
    MEMBER(_, { can }) {
        can('invite', 'User')
    },
}