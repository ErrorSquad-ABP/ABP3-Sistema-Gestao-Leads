import { apiFetch } from '@/lib/http/api-client';

import type {
	AccessGroup,
	CreateUserInput,
	ListUsersResponse,
	UpdateUserInput,
	UserRecord,
} from '../model/users.model';

async function listUsers(options: {
	page: number;
	limit: number;
}): Promise<ListUsersResponse> {
	const search = new URLSearchParams({
		page: String(options.page),
		limit: String(options.limit),
	});

	return apiFetch<ListUsersResponse>(`/api/users?${search.toString()}`);
}

async function createUser(input: CreateUserInput): Promise<UserRecord> {
	return apiFetch<UserRecord>('/api/users', {
		method: 'POST',
		body: {
			...input,
			teamId: input.teamId ?? null,
			accessGroupId: input.accessGroupId ?? null,
		},
	});
}

async function updateUser(
	userId: string,
	input: UpdateUserInput,
): Promise<UserRecord> {
	return apiFetch<UserRecord>(`/api/users/${userId}`, {
		method: 'PATCH',
		body: {
			...input,
			teamId: input.teamId ?? null,
			accessGroupId: input.accessGroupId ?? null,
		},
	});
}

async function deleteUser(userId: string): Promise<void> {
	await apiFetch(`/api/users/${userId}`, {
		method: 'DELETE',
	});
}

async function listAccessGroups(): Promise<AccessGroup[]> {
	return apiFetch<AccessGroup[]>('/api/users/access-groups');
}

async function createAccessGroup(
	input: Omit<AccessGroup, 'id' | 'isSystemGroup'>,
): Promise<AccessGroup> {
	return apiFetch<AccessGroup>('/api/users/access-groups', {
		method: 'POST',
		body: input,
	});
}

async function updateAccessGroup(
	groupId: string,
	input: Partial<Omit<AccessGroup, 'id' | 'isSystemGroup'>>,
): Promise<AccessGroup> {
	return apiFetch<AccessGroup>(`/api/users/access-groups/${groupId}`, {
		method: 'PATCH',
		body: input,
	});
}

async function deleteAccessGroup(groupId: string): Promise<void> {
	await apiFetch(`/api/users/access-groups/${groupId}`, {
		method: 'DELETE',
	});
}

export {
	createAccessGroup,
	createUser,
	deleteAccessGroup,
	deleteUser,
	listAccessGroups,
	listUsers,
	updateAccessGroup,
	updateUser,
};
