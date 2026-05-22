import type { AuthenticatedUser } from '@/features/login/types/login.types';

type UpdateOwnEmailInput = {
	currentPassword: string;
	email: string;
};

type UpdateOwnPasswordInput = {
	currentPassword: string;
	newPassword: string;
};

type CredentialUpdateResponse = AuthenticatedUser & {
	refreshSessionsRevoked: boolean;
};

export type {
	CredentialUpdateResponse,
	UpdateOwnEmailInput,
	UpdateOwnPasswordInput,
};
