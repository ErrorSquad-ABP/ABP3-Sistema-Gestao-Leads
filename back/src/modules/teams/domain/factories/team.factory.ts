import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Team } from '../entities/team.entity.js';

type CreateTeamParams = {
	readonly name: string;
	readonly storeId: string;
	readonly managerId: string | null;
	/** Papel do utilizador gerente; obrigatório quando `managerId` não é null (validado no agregado). */
	readonly managerRole: UserRole | null;
	/** Opcional: ids de usuários que entram como membros na criação. */
	readonly initialMemberUserIds?: readonly string[];
};

class TeamFactory {
	create(params: CreateTeamParams): Team {
		const memberIds =
			params.initialMemberUserIds?.map((id) => Uuid.parse(id)) ?? [];
		const unique: typeof memberIds = [];
		for (const id of memberIds) {
			if (!unique.some((u) => u.equals(id))) {
				unique.push(id);
			}
		}

		return new Team(
			Uuid.generate(),
			Name.create(params.name),
			Uuid.parse(params.storeId),
			params.managerId === null ? null : Uuid.parse(params.managerId),
			unique,
			params.managerRole,
			'new',
		);
	}
}

export type { CreateTeamParams };
export { TeamFactory };
