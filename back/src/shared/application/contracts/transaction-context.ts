/**
 * Opaque handle passed to repositories inside a transaction (diagram: TransactionContext).
 * The concrete `client` is provided by infrastructure (e.g. Prisma interactive transaction client).
 */
interface TransactionContext {
	client: object;
}

export type { TransactionContext };
