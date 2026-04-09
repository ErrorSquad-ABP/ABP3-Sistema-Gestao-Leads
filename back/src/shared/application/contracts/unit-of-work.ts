import type { TransactionContext } from './transaction-context.js';

const UNIT_OF_WORK = Symbol('IUnitOfWork');

/**
 * Application-level unit of work (diagram: IUnitOfWork).
 *
 * Prefer {@link IUnitOfWork.run} for transactional use cases: it owns begin/commit/rollback
 * and avoids calling `rollback` after a failed `commit` (which has already cleared state).
 * `begin` / `commit` / `rollback` remain available for advanced or non-standard flows.
 */
interface IUnitOfWork {
	run<T>(fn: () => Promise<T>): Promise<T>;
	begin(): Promise<void>;
	commit(): Promise<void>;
	rollback(): Promise<void>;
	getTransactionContext(): TransactionContext;
}

export type { IUnitOfWork };
export { UNIT_OF_WORK };
