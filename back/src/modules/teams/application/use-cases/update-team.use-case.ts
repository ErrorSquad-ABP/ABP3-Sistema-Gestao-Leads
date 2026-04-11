import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { DomainValidationError } from '../../../../shared/domain/errors/domain-validation.error.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { StoreRepositoryFactory } from '../../../stores/infrastructure/persistence/factories/store-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { canManageTeam } from '../services/team-manager-policy.js';
import { TeamInvalidManagerError } from '../../domain/errors/team-invalid-manager.error.js';
import { TeamInvalidStoreError } from '../../domain/errors/team-invalid-store.error.js';
import { TeamNotFoundError } from '../../domain/errors/team-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { TeamFactory } from '../../domain/factories/team.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';
import type { UpdateTeamDto } from '../dto/update-team.dto.js';

function hasTeamUpdatePayload(dto: UpdateTeamDto): boolean {
	return (
		dto.name !== undefined ||
		dto.managerId !== undefined ||
		dto.storeId !== undefined
	);
}

@Injectable()
class UpdateTeamUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly teamFactory: TeamFactory,
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
	) {}

	async execute(teamId: string, dto: UpdateTeamDto) {
		if (!hasTeamUpdatePayload(dto)) {
			throw new DomainValidationError(
				'Informe ao menos um campo para atualizar a equipe.',
				{ code: 'team.update.no_fields' },
			);
		}

		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const teams = this.teamRepositoryFactory.create(transactionContext);
			const stores = this.storeRepositoryFactory.create(transactionContext);
			const users = this.userRepositoryFactory.create(transactionContext);

			const existing = await teams.findById(Uuid.parse(teamId));
			if (!existing) {
				throw new TeamNotFoundError(teamId);
			}

			if (dto.managerId) {
				const manager = await users.findById(Uuid.parse(dto.managerId));
				if (!manager || !canManageTeam(manager.role)) {
					throw new TeamInvalidManagerError(dto.managerId);
				}
			}

			if (dto.storeId) {
				const store = await stores.findById(Uuid.parse(dto.storeId));
				if (!store) {
					throw new TeamInvalidStoreError(dto.storeId);
				}
			}

			const updatedTeam = this.teamFactory.update(existing, dto);
			return teams.update(updatedTeam);
		});
	}
}

export { UpdateTeamUseCase };
