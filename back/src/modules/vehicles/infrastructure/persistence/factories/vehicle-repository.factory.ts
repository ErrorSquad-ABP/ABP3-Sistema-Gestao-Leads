import { Injectable } from '@nestjs/common';

import type { TransactionContext } from '../../../../../shared/application/contracts/transaction-context.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { IVehicleRepository } from '../../../domain/repositories/vehicle.repository.js';
import { VehiclePrismaRepository } from '../repositories/vehicle-prisma.repository.js';

@Injectable()
class VehicleRepositoryFactory {
	constructor(private readonly prisma: PrismaService) {}

	create(transactionContext?: TransactionContext): IVehicleRepository {
		return new VehiclePrismaRepository(this.prisma, transactionContext);
	}
}

export { VehicleRepositoryFactory };
