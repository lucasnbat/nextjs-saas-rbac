// aqui vão as regras de permissão

import { createMongoAbility, ForcedSubject, CreateAbility, MongoAbility, AbilityBuilder } from '@casl/ability';

// duas permissões/ ações, manage é tipo poder fazer tudo
// manage é algo interno da biblioteca
const actions = ['manage', 'invite', 'delete'] as const;

// entidades, all é uma tipo dizer que o usuário pode fazer algo em todas as entidades
// all é algo interno da biblioteca
const subjects = ['User', 'all'] as const;

type AppAbilities = [
    typeof actions[number],
    typeof subjects[number] | ForcedSubject<Exclude<typeof subjects[number], 'all'>>
];

export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

// definindo permissões para usuário
const { build, can, cannot } = new AbilityBuilder(createAppAbility)

// usuário pode convidar outro usuário
can('invite', 'User')

// regra para fins didáticos, afinal, por padrão um usuário não pode deletar outro
cannot('delete', 'User')

export const ability = build()