import type { TeamResponseDto } from '../../application/dto/team-response.dto.js';
import type { Team } from '../../domain/entities/team.entity.js';

class TeamPresenter {
	static toResponse(team: Team): TeamResponseDto {
		return {
			id: team.id.value,
			name: team.name.value,
			managerId: team.managerId?.value ?? null,
			storeId: team.storeId?.value ?? null,
		} as TeamResponseDto;
	}

	static toResponseList(teams: Team[]): TeamResponseDto[] {
		return teams.map((team) => TeamPresenter.toResponse(team));
	}
}

export { TeamPresenter };
