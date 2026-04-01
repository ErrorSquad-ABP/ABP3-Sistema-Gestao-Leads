import type { TransactionContext } from './transaction-context.js';

const UNIT_OF_WORK = Symbol('IUnitOfWork');

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

export { UNIT_OF_WORK };
export type { IUnitOfWork };
