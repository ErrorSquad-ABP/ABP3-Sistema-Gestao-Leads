import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../../shared/domain/value-objects/name.value-object.js';
import { Team } from '../../../domain/entities/team.entity.js';
import type { TeamRecord } from '../records/team.record.js';

type TeamPrismaRow = {
	readonly id: string;
	readonly name: string;
	readonly storeId: string;
	readonly managerId: string | null;
	readonly members: readonly { readonly id: string }[];
};

class TeamMapper {
	static toDomain(record: TeamPrismaRow): Team {
		return new Team(
			Uuid.parse(record.id),
			Name.create(record.name),
			Uuid.parse(record.storeId),
			record.managerId === null ? null : Uuid.parse(record.managerId),
			record.members.map((m) => Uuid.parse(m.id)),
			null,
			'persistence',
		);
	}

	static toRecord(team: Team): TeamRecord {
		return {
			id: team.id.value,
			name: team.name.value,
			storeId: team.storeId.value,
			managerId: team.managerId?.value ?? null,
			memberUserIds: team.memberUserIds.map((id) => id.value),
		};
	}
}

export { TeamMapper };
