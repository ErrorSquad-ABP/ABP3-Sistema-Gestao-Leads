import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { TeamAccessDeniedError } from '../../domain/errors/team-access-denied.error.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';
import type { CreateTeamDto } from '../dto/create-team.dto.js';
import type { TeamActor } from '../types/team-actor.js';

type TeamScope =
	| { kind: 'full' }
	| {
			kind: 'scoped';
			readonly readTeamIds: ReadonlySet<string>;
			readonly mutateTeamIds: ReadonlySet<string>;
			readonly storeIds: ReadonlySet<string>;
	  };

/**
 * Escopo comercial para equipes: ADMINISTRATOR e GENERAL_MANAGER sem limite;
 * MANAGER apenas equipes/lojas derivadas das relações membro/gerente no domínio.
 */
@Injectable()
class TeamAccessPolicy {
	constructor(
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
	) {}

	private async resolveScope(actor: TeamActor): Promise<TeamScope> {
		if (actor.role === 'ADMINISTRATOR' || actor.role === 'GENERAL_MANAGER') {
			return { kind: 'full' };
		}

		if (actor.role !== 'MANAGER') {
			throw new TeamAccessDeniedError();
		}

		const users = this.userRepositoryFactory.create();
		const user = await users.findById(Uuid.parse(actor.userId));
		if (!user) {
			throw new TeamAccessDeniedError();
		}

		const readTeamIds = new Set<string>([
			...user.memberTeamIds.map((t) => t.value),
			...user.managedTeamIds.map((t) => t.value),
		]);
		const mutateTeamIds = new Set(user.managedTeamIds.map((t) => t.value));

		const teams = this.teamRepositoryFactory.create();
		const teamEntities =
			readTeamIds.size > 0
				? await teams.listByIds([...readTeamIds].map((id) => Uuid.parse(id)))
				: [];
		const storeIds = new Set(teamEntities.map((t) => t.storeId.value));

		return {
			kind: 'scoped',
			readTeamIds,
			mutateTeamIds,
			storeIds,
		};
	}

	async assertCanReadTeam(actor: TeamActor, teamId: string): Promise<void> {
		const scope = await this.resolveScope(actor);
		if (scope.kind === 'full') {
			return;
		}
		if (!scope.readTeamIds.has(teamId)) {
			throw new TeamAccessDeniedError();
		}
	}

	async assertCanMutateTeam(actor: TeamActor, teamId: string): Promise<void> {
		const scope = await this.resolveScope(actor);
		if (scope.kind === 'full') {
			return;
		}
		if (!scope.mutateTeamIds.has(teamId)) {
			throw new TeamAccessDeniedError(
				'Apenas o gerente da equipe ou perfis superiores podem alterar este recurso.',
			);
		}
	}

	async assertCanCreateTeam(
		actor: TeamActor,
		dto: CreateTeamDto,
	): Promise<void> {
		const scope = await this.resolveScope(actor);
		if (scope.kind === 'full') {
			return;
		}

		if (!scope.storeIds.has(dto.storeId)) {
			throw new TeamAccessDeniedError(
				'Criacao de equipe permitida apenas em lojas onde o utilizador ja possui equipe vinculada.',
			);
		}

		const managerId = dto.managerId ?? null;
		if (managerId !== null && managerId !== actor.userId) {
			throw new TeamAccessDeniedError(
				'Gerentes de loja so podem indicar a si proprios como gerente da nova equipe.',
			);
		}
	}

	async assertStoreAllowedForManager(
		actor: TeamActor,
		storeId: string,
	): Promise<void> {
		const scope = await this.resolveScope(actor);
		if (scope.kind === 'full') {
			return;
		}
		if (!scope.storeIds.has(storeId)) {
			throw new TeamAccessDeniedError(
				'Transferencia da equipe para esta loja nao permitida para o seu escopo.',
			);
		}
	}

	async listTeamIdsForActor(
		actor: TeamActor,
	): Promise<{ mode: 'all' } | { mode: 'ids'; ids: readonly string[] }> {
		const scope = await this.resolveScope(actor);
		if (scope.kind === 'full') {
			return { mode: 'all' };
		}
		return { mode: 'ids', ids: [...scope.readTeamIds] };
	}
}

export { TeamAccessPolicy };
