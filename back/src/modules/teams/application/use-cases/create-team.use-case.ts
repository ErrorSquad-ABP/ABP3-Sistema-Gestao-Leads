import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { StoreRepositoryFactory } from '../../../stores/infrastructure/persistence/factories/store-repository.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { UserRepositoryFactory } from '../../../users/infrastructure/persistence/factories/user-repository.factory.js';
import { canManageTeam } from '../services/team-manager-policy.js';
import { TeamInvalidManagerError } from '../../domain/errors/team-invalid-manager.error.js';
import { TeamInvalidStoreError } from '../../domain/errors/team-invalid-store.error.js';
// biome-ignore lint/style/useImportType: Nest needs class values for constructor injection metadata
import { TeamFactory } from '../../domain/factories/team.factory.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injecao
import { TeamRepositoryFactory } from '../../infrastructure/persistence/factories/team-repository.factory.js';
import type { CreateTeamDto } from '../dto/create-team.dto.js';

@Injectable()
class CreateTeamUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly teamFactory: TeamFactory,
		private readonly teamRepositoryFactory: TeamRepositoryFactory,
		private readonly storeRepositoryFactory: StoreRepositoryFactory,
		private readonly userRepositoryFactory: UserRepositoryFactory,
	) {}

	async execute(dto: CreateTeamDto) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const teams = this.teamRepositoryFactory.create(transactionContext);
			const stores = this.storeRepositoryFactory.create(transactionContext);
			const users = this.userRepositoryFactory.create(transactionContext);

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

			const team = this.teamFactory.create(dto);
			return teams.create(team);
		});
	}
}

export { CreateTeamUseCase };
