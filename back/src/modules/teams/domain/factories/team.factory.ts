import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../shared/domain/value-objects/name.value-object.js';
import { Team } from '../entities/team.entity.js';

type CreateTeamParams = {
	readonly name: string;
	readonly managerId: string | null;
	readonly storeId: string | null;
};

type UpdateTeamParams = {
	readonly name?: string;
	readonly managerId?: string | null;
	readonly storeId?: string | null;
};

class TeamFactory {
	create(params: CreateTeamParams): Team {
		return new Team(
			Uuid.generate(),
			Name.create(params.name),
			params.managerId ? Uuid.parse(params.managerId) : null,
			params.storeId ? Uuid.parse(params.storeId) : null,
		);
	}

	update(team: Team, params: UpdateTeamParams): Team {
		const updatedTeam = new Team(
			team.id,
			team.name,
			team.managerId,
			team.storeId,
		);
		if (params.name !== undefined) {
			updatedTeam.changeName(Name.create(params.name));
		}

		if (params.managerId !== undefined && params.managerId !== null) {
			updatedTeam.assignManager(Uuid.parse(params.managerId));
		}
		if (params.managerId === null) {
			updatedTeam.clearManager();
		}
		if (params.storeId !== undefined && params.storeId !== null) {
			updatedTeam.assignStore(Uuid.parse(params.storeId));
		}
		if (params.storeId === null) {
			updatedTeam.clearStore();
		}

		return updatedTeam;
	}
}

export { TeamFactory };
export type { CreateTeamParams, UpdateTeamParams };
