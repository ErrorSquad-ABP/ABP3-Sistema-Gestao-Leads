import { Injectable } from '@nestjs/common';

import type { User } from '../../domain/entities/user.entity.js';
import type { UsersAggregateSummary } from '../../domain/repositories/user.repository.js';
// biome-ignore lint/style/useImportType: Nest DI
import { UserRepositoryFactory } from '../../infrastructure/persistence/factories/user-repository.factory.js';

type ListUsersQuery = {
	readonly page: number;
	readonly limit: number;
	readonly search?: string;
	readonly role?: string;
	readonly accessGroupId?: string;
};

type ListUsersResult = {
	readonly users: readonly User[];
	readonly page: number;
	readonly limit: number;
	readonly total: number;
	readonly totalPages: number;
	readonly summary: UsersAggregateSummary;
};

function computeTotalPages(total: number, limit: number): number {
	if (total === 0) {
		return 0;
	}
	return Math.ceil(total / limit);
}

@Injectable()
class ListUsersUseCase {
	constructor(private readonly userRepositoryFactory: UserRepositoryFactory) {}

	async execute(query: ListUsersQuery): Promise<ListUsersResult> {
		const users = this.userRepositoryFactory.create();
		const [{ users: pageUsers, total }, summary] = await Promise.all([
			users.listPaged({
				page: query.page,
				limit: query.limit,
				search: query.search,
				role: query.role,
				accessGroupId: query.accessGroupId,
			}),
			users.aggregateSummary(),
		]);
		return {
			users: pageUsers,
			page: query.page,
			limit: query.limit,
			total,
			totalPages: computeTotalPages(total, query.limit),
			summary,
		};
	}
}

export { ListUsersUseCase };
