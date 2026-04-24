import { apiFetch } from '@/lib/http/api-client';

import { credentialUpdateResponseSchema } from '../schemas/profile.schema';
import type {
	CredentialUpdateResponse,
	UpdateOwnEmailInput,
	UpdateOwnPasswordInput,
} from '../types/profile.types';

async function updateOwnEmail(
	input: UpdateOwnEmailInput,
): Promise<CredentialUpdateResponse> {
	const payload = await apiFetch<unknown>('/api/auth/me/email', {
		method: 'PATCH',
		body: input,
	});

	return credentialUpdateResponseSchema.parse(payload);
}

async function updateOwnPassword(
	input: UpdateOwnPasswordInput,
): Promise<CredentialUpdateResponse> {
	const payload = await apiFetch<unknown>('/api/auth/me/password', {
		method: 'PATCH',
		body: input,
	});

	return credentialUpdateResponseSchema.parse(payload);
}

export { updateOwnEmail, updateOwnPassword };
