import type { UserSummary } from '../types/users.types';

function createUserLabel(user: UserSummary) {
	return `${user.name} (${user.email})`;
}

export { createUserLabel };
