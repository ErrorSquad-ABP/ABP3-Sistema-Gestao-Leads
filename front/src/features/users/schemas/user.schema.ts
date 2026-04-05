import type { PaginatedUsersResponse, UserSummary } from '../types/users.types';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function parseUser(value: unknown): UserSummary {
	if (!isRecord(value)) {
		throw new TypeError('Contrato HTTP inválido para user.');
	}

	return {
		id: String(value.id),
		name: String(value.name),
		email: String(value.email),
		role: String(value.role) as UserSummary['role'],
		teamId:
			value.teamId === null || value.teamId === undefined
				? null
				: String(value.teamId),
		team:
			value.team && isRecord(value.team)
				? {
						id: String(value.team.id),
						name: String(value.team.name),
					}
				: null,
	};
}

function parseUsersPage(value: unknown): PaginatedUsersResponse {
	if (!isRecord(value)) {
		throw new TypeError('Contrato HTTP inválido para paginação de users.');
	}

	const items = Array.isArray(value.items) ? value.items.map(parseUser) : [];

	return {
		items,
		page: Number(value.page ?? 1),
		limit: Number(value.limit ?? items.length),
		total: Number(value.total ?? items.length),
		totalPages: Number(value.totalPages ?? (items.length > 0 ? 1 : 0)),
	};
}

export { parseUser, parseUsersPage };
