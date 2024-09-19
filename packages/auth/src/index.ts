// aqui vão as regras de permissão

import { createMongoAbility, ForcedSubject, CreateAbility, MongoAbility, AbilityBuilder } from '@casl/ability';
import { User } from './models/user';
import { permissions } from './permissions';

// duas permissões/ ações, manage é tipo poder fazer tudo
// manage é algo interno da biblioteca
const actions = ['manage', 'invite', 'delete'] as const;

// entidades, all é uma tipo dizer que o usuário pode fazer algo em todas as entidades
// all é algo interno da biblioteca
const subjects = ['User', 'all'] as const;

/**
 * AppAbilities combina ações e sujeitos, incluindo a entidade forçada 
 * ForcedSubject para especificar casos onde 'all' não deve ser considerado.
 */
type AppAbilities = [
    typeof actions[number],
    typeof subjects[number] | ForcedSubject<Exclude<typeof subjects[number], 'all'>>
];

// aparentemente isso é uma tipagem para o createMongoAbility que será guardado
// no createAppAbility
export type AppAbility = MongoAbility<AppAbilities>;

// cria o conjunto de regras que será aplicado no sistema
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor(user: User) {
    // definindo permissões específicas
    const builder = new AbilityBuilder(createAppAbility)

    // itera dentro de permissões buscando alguma role que seja igual ao do usuário
    // recebido
    if (typeof permissions[user.role] !== 'function') {
        throw new Error(`Permissions for role ${user.role} not found`)
    }

    // ativa a permissão passando o usuário recebido + o builder que cria permissões
    permissions[user.role](user, builder)

    // usa o método para montar as permissões e disponibilizar can(), cannnt()...
    const ability = builder.build()

    return ability

    // usuário pode convidar outro usuário
    // can('invite', 'User'

    // regra para fins didáticos, afinal, por padrão um usuário não pode deletar outro
    // cannot('delete', 'User')

    // ability guarda as permissões e exporta para usos em outros arquivos
    // export const ability = build()
}