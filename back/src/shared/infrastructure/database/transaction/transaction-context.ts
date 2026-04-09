import type { Prisma } from '../../../../generated/prisma/client.js';

import type { TransactionContext as TransactionContextContract } from '../../../application/contracts/transaction-context.js';

/**
 * Infrastructure handle for an active Prisma interactive transaction client.
 */
class TransactionContext implements TransactionContextContract {
	readonly client: object;

	constructor(client: Prisma.TransactionClient) {
		this.client = client;
	}
}

export { TransactionContext };
