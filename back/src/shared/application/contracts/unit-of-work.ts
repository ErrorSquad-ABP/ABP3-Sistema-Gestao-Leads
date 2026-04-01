import type { TransactionContext } from './transaction-context.js';

/**
 * Application-level unit of work (diagram: IUnitOfWork).
 * Use cases call `begin` before work, `commit` on success, `rollback` on failure.
 */
interface IUnitOfWork {
	begin(): Promise<void>;
	commit(): Promise<void>;
	rollback(): Promise<void>;
	getTransactionContext(): TransactionContext;
}

export type { IUnitOfWork };
