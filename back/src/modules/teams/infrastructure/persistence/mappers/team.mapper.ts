import { Uuid } from '../../../../../shared/domain/types/identifiers.js';
import { Name } from '../../../../../shared/domain/value-objects/name.value-object.js';
import { Team } from '../../../domain/entities/team.entity.js';
import type { TeamRecord } from '../records/team.record.js';

class TeamMapper {
	static toDomain(record: TeamRecord): Team {
		return new Team(
			Uuid.parse(record.id),
			Name.create(record.name),
			record.managerId === null ? null : Uuid.parse(record.managerId),
		);
	}

	static toRecord(team: Team): TeamRecord {
		return {
			id: team.id.value,
			name: team.name.value,
			managerId: team.managerId?.value ?? null,
		};
	}
}

export { TeamMapper };
