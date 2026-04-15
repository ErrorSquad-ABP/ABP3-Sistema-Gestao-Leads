import { Injectable } from '@nestjs/common';

import { Uuid } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamRepositoryFactory } from '../../../teams/infrastructure/persistence/factories/team-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import type { Lead } from '../../domain/entities/lead.entity.js';
import { LeadAccessDeniedError } from '../../domain/errors/lead-access-denied.error.js';
import type { LeadActor } from '../types/lead-actor.js';

type LeadScope =
	| { kind: 'full' }
	| {
			kind: 'attendant';
			readonly actorUserId: string;
			readonly readTeamIds: ReadonlySet<string>;
			readonly readStoreIds: ReadonlySet<string>;
	  }
	| {
			kind: 'manager';
			readonly actorUserId: string;
			readonly readTeamIds: ReadonlySet<string>;
			readonly mutateTeamIds: ReadonlySet<string>;
			readonly readStoreIds: ReadonlySet<string>;
			readonly mutateStoreIds: ReadonlySet<string>;
	  };

function unionTeamIds(ids: readonly { value: string }[]): string[] {
	return [...new Set(ids.map((id) => id.value))];
}

@Injectable()
class LeadAccessPolicy {
	constructor(
		private readonly userRepositoryFactory: UserRepositoryFactory,
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
	) {}

	private async resolveScope(actor: LeadActor): Promise<LeadScope> {
		if (actor.role === 'ADMINISTRATOR' || actor.role === 'GENERAL_MANAGER') {
			return { kind: 'full' };
		}

		const users = this.userRepositoryFactory.create();
		const user = await users.findById(Uuid.parse(actor.userId));
		if (!user) {
			throw new LeadAccessDeniedError();
		}

		const memberTeamIds = unionTeamIds(user.memberTeamIds);
		const managedTeamIds = unionTeamIds(user.managedTeamIds);
		const readableTeamIds =
			actor.role === 'MANAGER'
				? [...new Set([...memberTeamIds, ...managedTeamIds])]
				: memberTeamIds;

		const teams = this.teamRepositoryFactory.create();
		const readTeams =
			readableTeamIds.length > 0
				? await teams.listByIds(readableTeamIds.map((id) => Uuid.parse(id)))
				: [];
		const managedTeams =
			managedTeamIds.length > 0
				? await teams.listByIds(managedTeamIds.map((id) => Uuid.parse(id)))
				: [];

		if (actor.role === 'MANAGER') {
			return {
				kind: 'manager',
				actorUserId: actor.userId,
				readTeamIds: new Set(readableTeamIds),
				mutateTeamIds: new Set(managedTeamIds),
				readStoreIds: new Set(readTeams.map((team) => team.storeId.value)),
				mutateStoreIds: new Set(managedTeams.map((team) => team.storeId.value)),
			};
		}

		return {
			kind: 'attendant',
			actorUserId: actor.userId,
			readTeamIds: new Set(readableTeamIds),
			readStoreIds: new Set(readTeams.map((team) => team.storeId.value)),
		};
	}

	async resolveCatalogScope(actor: LeadActor): Promise<LeadScope> {
		return this.resolveScope(actor);
	}

	private async targetUserTeamIds(userId: string): Promise<readonly string[]> {
		const users = this.userRepositoryFactory.create();
		const user = await users.findById(Uuid.parse(userId));
		if (!user) {
			return [];
		}
		return [
			...new Set([
				...unionTeamIds(user.memberTeamIds),
				...unionTeamIds(user.managedTeamIds),
			]),
		];
	}

	private async targetUserStoreIds(
		userId: string,
	): Promise<ReadonlySet<string>> {
		const teamIds = await this.targetUserTeamIds(userId);
		if (teamIds.length === 0) {
			return new Set();
		}
		const teams = this.teamRepositoryFactory.create();
		const entities = await teams.listByIds(teamIds.map((id) => Uuid.parse(id)));
		return new Set(entities.map((team) => team.storeId.value));
	}

	private async targetUserIntersectsTeams(
		userId: string,
		allowedTeamIds: ReadonlySet<string>,
	): Promise<boolean> {
		const teamIds = await this.targetUserTeamIds(userId);
		return teamIds.some((teamId) => allowedTeamIds.has(teamId));
	}

	async assertCanListOwner(
		actor: LeadActor,
		ownerUserId: string,
	): Promise<void> {
		const scope = await this.resolveScope(actor);
		if (scope.kind === 'full') {
			return;
		}
		if (ownerUserId === scope.actorUserId) {
			return;
		}
		if (scope.kind === 'attendant') {
			throw new LeadAccessDeniedError(
				'Atendentes podem consultar apenas os proprios leads.',
			);
		}
		if (
			!(await this.targetUserIntersectsTeams(ownerUserId, scope.readTeamIds))
		) {
			throw new LeadAccessDeniedError(
				'Consulta permitida apenas para proprietarios dentro do seu escopo de equipes.',
			);
		}
	}

	async assertCanListTeam(actor: LeadActor, teamId: string): Promise<void> {
		const scope = await this.resolveScope(actor);
		if (scope.kind === 'full') {
			return;
		}
		if (scope.kind === 'attendant') {
			throw new LeadAccessDeniedError(
				'Atendentes nao podem consultar leads por equipe.',
			);
		}
		if (!scope.readTeamIds.has(teamId)) {
			throw new LeadAccessDeniedError(
				'Consulta permitida apenas para equipes dentro do seu escopo.',
			);
		}
	}

	/** Listagem sem filtro por owner/equipa: alinhado a `resolveScope` com `kind: 'full'`. */
	async assertCanListAllLeads(actor: LeadActor): Promise<void> {
		if (actor.role === 'ADMINISTRATOR' || actor.role === 'GENERAL_MANAGER') {
			return;
		}
		throw new LeadAccessDeniedError(
			'Listagem global permitida apenas para administrador ou gestor geral.',
		);
	}

	/**
	 * Listagem paginada unificada das equipas visíveis ao gestor (`memberTeams` ∪ `managedTeams`).
	 */
	async resolveManagerListTeamIds(
		actor: LeadActor,
	): Promise<readonly string[]> {
		const scope = await this.resolveScope(actor);
		if (scope.kind !== 'manager') {
			throw new LeadAccessDeniedError(
				'Listagem unificada por equipas disponivel apenas para gestores de equipa.',
			);
		}
		return [...scope.readTeamIds];
	}

	async assertCanReadLead(actor: LeadActor, lead: Lead): Promise<void> {
		const scope = await this.resolveScope(actor);
		if (scope.kind === 'full') {
			return;
		}
		if (lead.ownerUserId?.value === scope.actorUserId) {
			return;
		}
		if (scope.kind === 'attendant') {
			throw new LeadAccessDeniedError(
				'Atendentes podem acessar apenas os proprios leads.',
			);
		}
		if (lead.ownerUserId === null) {
			if (!scope.readStoreIds.has(lead.storeId.value)) {
				throw new LeadAccessDeniedError();
			}
			return;
		}
		if (
			!(await this.targetUserIntersectsTeams(
				lead.ownerUserId.value,
				scope.readTeamIds,
			))
		) {
			throw new LeadAccessDeniedError();
		}
	}

	async assertCanMutateLead(actor: LeadActor, lead: Lead): Promise<void> {
		const scope = await this.resolveScope(actor);
		if (scope.kind === 'full') {
			return;
		}
		if (lead.ownerUserId?.value === scope.actorUserId) {
			return;
		}
		if (scope.kind === 'attendant') {
			throw new LeadAccessDeniedError(
				'Atendentes podem alterar apenas os proprios leads.',
			);
		}
		if (lead.ownerUserId === null) {
			if (!scope.mutateStoreIds.has(lead.storeId.value)) {
				throw new LeadAccessDeniedError();
			}
			return;
		}
		if (
			!(await this.targetUserIntersectsTeams(
				lead.ownerUserId.value,
				scope.mutateTeamIds,
			))
		) {
			throw new LeadAccessDeniedError();
		}
	}

	async assertCanCreateLead(
		actor: LeadActor,
		input: { readonly storeId: string; readonly ownerUserId: string | null },
	): Promise<void> {
		const scope = await this.resolveScope(actor);
		if (scope.kind === 'full') {
			return;
		}
		if (!scope.readStoreIds.has(input.storeId)) {
			throw new LeadAccessDeniedError(
				'Criacao de lead permitida apenas para lojas dentro do seu escopo.',
			);
		}
		if (input.ownerUserId === null || input.ownerUserId === scope.actorUserId) {
			return;
		}
		if (scope.kind === 'attendant') {
			throw new LeadAccessDeniedError(
				'Atendentes nao podem atribuir leads a outros usuarios.',
			);
		}
		if (
			!(await this.targetUserIntersectsTeams(
				input.ownerUserId,
				scope.readTeamIds,
			))
		) {
			throw new LeadAccessDeniedError(
				'Atribuicao permitida apenas para usuarios dentro do seu escopo.',
			);
		}
		const ownerStoreIds = await this.targetUserStoreIds(input.ownerUserId);
		if (!ownerStoreIds.has(input.storeId)) {
			throw new LeadAccessDeniedError(
				'O novo proprietario precisa pertencer a uma equipe da loja do lead.',
			);
		}
	}

	async assertCanAssignOwner(
		actor: LeadActor,
		leadStoreId: string,
		ownerUserId: string | null,
	): Promise<void> {
		const scope = await this.resolveScope(actor);
		if (scope.kind === 'full' || ownerUserId === null) {
			return;
		}
		if (ownerUserId === scope.actorUserId) {
			if (!scope.readStoreIds.has(leadStoreId)) {
				throw new LeadAccessDeniedError();
			}
			return;
		}
		if (scope.kind === 'attendant') {
			throw new LeadAccessDeniedError(
				'Atendentes nao podem reatribuir leads para outros usuarios.',
			);
		}
		if (
			!(await this.targetUserIntersectsTeams(ownerUserId, scope.readTeamIds))
		) {
			throw new LeadAccessDeniedError(
				'Atribuicao permitida apenas para usuarios dentro do seu escopo.',
			);
		}
		const ownerStoreIds = await this.targetUserStoreIds(ownerUserId);
		if (!ownerStoreIds.has(leadStoreId)) {
			throw new LeadAccessDeniedError(
				'O novo proprietario precisa pertencer a uma equipe da loja do lead.',
			);
		}
	}
}

export { LeadAccessPolicy };
