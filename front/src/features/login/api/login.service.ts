import { ApiError } from '@/lib/http/api-error';
import { apiFetch } from '@/lib/http/api-client';

import {
	authenticatedUserSchema,
	loginResponseSchema,
} from '../schemas/login.schema';
import type {
	AuthenticatedUser,
	LoginInput,
	LoginResponse,
} from '../types/login.types';

async function login(input: LoginInput): Promise<LoginResponse> {
	const payload = await apiFetch<unknown>('/api/auth/login', {
		method: 'POST',
		body: input,
	});

	return loginResponseSchema.parse(payload);
}

async function fetchCurrentUser(): Promise<AuthenticatedUser | null> {
	try {
		const payload = await apiFetch<unknown>('/api/auth/me');
		return authenticatedUserSchema.parse(payload);
	} catch (error) {
		if (
			error instanceof ApiError &&
			(error.status === 401 || error.status === 403)
		) {
			return null;
		}

		throw error;
	}
}

export { fetchCurrentUser, login };
