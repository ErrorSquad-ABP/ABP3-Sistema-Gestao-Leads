import { Inject, Injectable } from '@nestjs/common';

import type { IUnitOfWork } from '../../../../shared/application/contracts/unit-of-work.js';
import { UNIT_OF_WORK } from '../../../../shared/application/contracts/unit-of-work.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UserRepositoryFactory } from '../../infrastructure/persistence/factories/user-repository.factory.js';

@Injectable()
class DeleteUserUseCase {
	@Inject(UNIT_OF_WORK)
	private readonly unitOfWork!: IUnitOfWork;

	constructor(private readonly userRepositoryFactory: UserRepositoryFactory) {}

	async execute(userId: string): Promise<void> {
		return this.unitOfWork.run(async () => {
			const transactionContext = this.unitOfWork.getTransactionContext();
			const users = this.userRepositoryFactory.create(transactionContext);

			const idVo = Uuid.parse(userId);
			const user = await users.findById(idVo);
			if (!user) {
				throw new UserNotFoundError(userId);
			}

			await users.delete(idVo);
		});
	}
}

export { DeleteUserUseCase };
