import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamAccessPolicy } from '../services/team-access-policy.service.js';
import type { TeamActor } from '../types/team-actor.js';

type TeamMemberCandidateResponse = {
	readonly id: string;
	readonly name: string;
	readonly email: string;
};

@Injectable()
class ListTeamMemberCandidatesUseCase {
	constructor(
		private readonly teamAccessPolicy: TeamAccessPolicy,
		private readonly userRepositoryFactory: UserRepositoryFactory,
	) {}

	async execute(
		actor: TeamActor,
		storeId: string,
	): Promise<TeamMemberCandidateResponse[]> {
		await this.teamAccessPolicy.assertCanUseStore(actor, storeId);

		const users = this.userRepositoryFactory.create();
		const candidates = await users.listTeamMemberCandidatesByStoreId(
			Uuid.parse(storeId),
		);
		return candidates.map((user) => ({
			id: user.id.value,
			name: user.name.value,
			email: user.email.value,
		}));
	}
}

export { ListTeamMemberCandidatesUseCase };
export type { TeamMemberCandidateResponse };
