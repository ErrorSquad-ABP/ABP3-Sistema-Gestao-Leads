import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import type { LeadActor } from '../types/lead-actor.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { LeadAccessPolicy } from '../services/lead-access-policy.service.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { TeamRepositoryFactory } from '../../../teams/infrastructure/persistence/factories/team-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';

@Injectable()
class ListLeadCatalogOwnersUseCase {
	constructor(
		private readonly leadAccessPolicy: LeadAccessPolicy,
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
	) {}

	async execute(actor: LeadActor) {
		const scope = await this.leadAccessPolicy.resolveCatalogScope(actor);
		const teams = this.teamRepositoryFactory.create();

		if (scope.kind === 'attendant') {
			const users = this.userRepositoryFactory.create();
			const currentUser = await users.findById(Uuid.parse(scope.actorUserId));
			if (!currentUser) {
				return [];
			}

			return [
				{
					id: currentUser.id.value,
					name: currentUser.name.value,
					email: currentUser.email.value,
					storeIds: [...scope.readStoreIds].sort(),
				},
			];
		}

		const scopedTeams =
			scope.kind === 'full'
				? await teams.list()
				: await teams.listByIds(
						[...scope.readTeamIds].map((id) => Uuid.parse(id)),
					);

		const storeIdsByUserId = new Map<string, Set<string>>();

		for (const team of scopedTeams) {
			const storeId = team.storeId.value;
			if (team.managerId) {
				const next =
					storeIdsByUserId.get(team.managerId.value) ?? new Set<string>();
				next.add(storeId);
				storeIdsByUserId.set(team.managerId.value, next);
			}

			for (const memberId of team.memberUserIds) {
				const next = storeIdsByUserId.get(memberId.value) ?? new Set<string>();
				next.add(storeId);
				storeIdsByUserId.set(memberId.value, next);
			}
		}

		const candidateUserIds = [...storeIdsByUserId.keys()].sort();
		if (candidateUserIds.length === 0) {
			return [];
		}

		const users = this.userRepositoryFactory.create();
		const entities = await users.listByIds(
			candidateUserIds.map((id) => Uuid.parse(id)),
		);

		return entities.map((user) => ({
			id: user.id.value,
			name: user.name.value,
			email: user.email.value,
			storeIds: [
				...(storeIdsByUserId.get(user.id.value) ?? new Set<string>()),
			].sort(),
		}));
	}
}

export { ListLeadCatalogOwnersUseCase };
