import { Injectable, Scope } from '@nestjs/common';

import type { Prisma } from '../../../../generated/prisma/client.js';

import type { IUnitOfWork } from '../../../application/contracts/unit-of-work.js';
// biome-ignore lint/style/useImportType: Nest needs the PrismaService class value for constructor injection metadata
import { PrismaService } from '../prisma/prisma.service.js';

import { TransactionContext } from './transaction-context.js';

class RollbackSignal extends Error {
	readonly code = 'UNIT_OF_WORK_ROLLBACK';

	constructor() {
		super('UnitOfWork rollback');
		this.name = 'RollbackSignal';
	}
}

/**
 * Prisma-backed unit of work: `begin` opens an interactive transaction;
 * `commit` / `rollback` close it. Use {@link getTransactionContext} for repository factories.
 *
 * Request-scoped so concurrent HTTP requests do not share transaction state.
 */
@Injectable({ scope: Scope.REQUEST })
class UnitOfWork implements IUnitOfWork {
	private tx: Prisma.TransactionClient | null = null;
	private transactionCompletion: Promise<unknown> | null = null;
	private resolveBarrier!: () => void;
	private rejectBarrier!: (error: Error) => void;

	constructor(private readonly prisma: PrismaService) {}

	async run<T>(fn: () => Promise<T>): Promise<T> {
		await this.begin();
		try {
			const result = await fn();
			await this.commit();
			return result;
		} catch (error: unknown) {
			await this.rollbackIfActive();
			throw error;
		}
	}

	async begin(): Promise<void> {
		if (this.tx !== null) {
			throw new Error('Transaction already started');
		}

		let resolveTx!: (tx: Prisma.TransactionClient) => void;
		let rejectTx!: (error: unknown) => void;
		const txPromise = new Promise<Prisma.TransactionClient>(
			(resolve, reject) => {
				resolveTx = resolve;
				rejectTx = reject;
			},
		);

		this.transactionCompletion = this.prisma.$transaction(async (client) => {
			resolveTx(client);
			await new Promise<void>((resolveBarrier, rejectBarrier) => {
				this.resolveBarrier = resolveBarrier;
				this.rejectBarrier = rejectBarrier;
			});
		});

		// Fail fast if interactive transaction errors before callback starts.
		this.transactionCompletion.catch((error: unknown) => {
			rejectTx(error);
		});

		try {
			this.tx = await txPromise;
		} catch (error) {
			this.reset();
			throw error;
		}
	}

	async commit(): Promise<void> {
		if (this.tx === null) {
			throw new Error('No active transaction');
		}
		this.resolveBarrier();
		try {
			await this.transactionCompletion;
		} finally {
			this.reset();
		}
	}

	async rollback(): Promise<void> {
		if (this.tx === null) {
			throw new Error('No active transaction');
		}
		this.rejectBarrier(new RollbackSignal());
		try {
			await this.transactionCompletion;
		} catch {
			/* Prisma rolls back interactive transaction on callback rejection */
		} finally {
			this.reset();
		}
	}

	getTransactionContext(): TransactionContext {
		if (this.tx === null) {
			throw new Error('No active transaction');
		}
		return new TransactionContext(this.tx);
	}

	private async rollbackIfActive(): Promise<void> {
		if (this.tx === null) {
			return;
		}
		try {
			await this.rollback();
		} catch {
			/* Prefer propagating the original failure from run(), not a secondary rollback error */
		}
	}

	private reset(): void {
		this.tx = null;
		this.transactionCompletion = null;
	}
}

export { RollbackSignal, UnitOfWork };
