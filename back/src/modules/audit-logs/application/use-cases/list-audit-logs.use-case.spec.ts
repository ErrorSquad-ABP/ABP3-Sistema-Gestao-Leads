import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import type { AuditLogRepositoryFactory } from '../../infrastructure/persistence/factories/audit-log-repository.factory.js';
import { ListAuditLogsUseCase } from './list-audit-logs.use-case.js';

describe('ListAuditLogsUseCase', () => {
	it('encaminha paginacao e filtros para o repositorio', async () => {
		const listPaged = mock.fn(async (_query: unknown) => ({
			items: [],
			page: 2,
			limit: 10,
			total: 0,
			totalPages: 0,
		}));
		const factory = {
			create: () => ({ listPaged }),
		} as unknown as AuditLogRepositoryFactory;
		const useCase = new ListAuditLogsUseCase(factory);

		const result = await useCase.execute({
			page: 2,
			limit: 10,
			category: 'cars',
			action: 'CREATE',
		});

		assert.equal(result.page, 2);
		assert.equal(result.limit, 10);
		assert.equal(listPaged.mock.calls.length, 1);
		assert.deepEqual(listPaged.mock.calls[0]?.arguments[0], {
			page: 2,
			limit: 10,
			category: 'cars',
			action: 'CREATE',
		});
	});
});
