import { AbilityBuilder } from "@casl/ability"
import { AppAbility } from "."
import { Role } from "./roles"

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
    ADMIN(user, { can, cannot }) {
        // pode gerenciar tudo...
        can('manage', 'all')

        // mas não pode manipular organização que não é dele
        // logo, primeiro negamos todo poder de transfer...
        // e depois dizemos qual é o único caso onde pode transferir
        // usar cannot ( neq: user.id )(não transfere o que não é do id dele )
        // não funcionaria,, pois uma vez que ele pode tudo (linha 24) não 
        // dá para usar cannots seletivos... não dá para passasr parâmetro 
        // para cannot
        cannot(['transfer_ownership', 'update'], 'Organization')
        can(['transfer_ownership', 'update'], 'Organization', { ownerId: { $eq: user.id } })

    },
    MEMBER(user, { can }) {
        can('get', 'User')
        can(['create', 'get'], 'Project')
        can(['update', 'delete'], 'Project', { ownerId: { $eq: user.id } })
    },
    BILLING(_, { can }) {
        can('manage', 'Billing')
    }
}