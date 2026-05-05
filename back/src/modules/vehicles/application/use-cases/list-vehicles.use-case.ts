import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { assertCanonicalVehicleStatus } from '../../../../shared/domain/enums/vehicle-status.enum.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
// biome-ignore lint/style/useImportType: Nest DI — tokens em runtime
import { VehicleRepositoryFactory } from '../../infrastructure/persistence/factories/vehicle-repository.factory.js';

type ListVehiclesFilters = {
	readonly storeId?: string;
	readonly status?: string;
	readonly withoutOpenDeal?: boolean;
};

@Injectable()
class ListVehiclesUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(
		private readonly vehicleRepositoryFactory: VehicleRepositoryFactory,
	) {}

	async execute(filters?: ListVehiclesFilters) {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const vehicles = this.vehicleRepositoryFactory.create(transactionContext);

			return vehicles.list({
				storeId: filters?.storeId ? Uuid.parse(filters.storeId) : undefined,
				status: filters?.status
					? assertCanonicalVehicleStatus(filters.status)
					: undefined,
				withoutOpenDeal: filters?.withoutOpenDeal,
			});
		});
	}
}

export { ListVehiclesUseCase };
export type { ListVehiclesFilters };
