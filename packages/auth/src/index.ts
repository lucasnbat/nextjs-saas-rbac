// aqui vão as regras de permissão

import { createMongoAbility, ForcedSubject, CreateAbility, MongoAbility, AbilityBuilder } from '@casl/ability';
import { User } from './models/user';
import { permissions } from './permissions';
import { UserSubject } from './subjects/user';
import { ProjectSubject } from './subjects/project';

/**
 * AppAbilities combina ações e sujeitos, incluindo a entidade forçada 
 * No caso abaixo, para cada subject eu já tenho o sujeito (Project) com
 * suas ações possíveis (manage, create and delete);
 * Se não cair em nenhum dos subjects predefinidos, vai cair no all,
 * que se refere a todos os subjects, e a opção manage indica 'poder ge-
 * renciar (CRUD) a entidade, no caso, todas as entidades/subjects;
 */
type AppAbilities = UserSubject | ProjectSubject | ['manage', 'all']

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
}