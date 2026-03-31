import { createDomainEnum } from './_shared/create-domain-enum.js';

const USER_ROLES = [
	'ATTENDANT',
	'MANAGER',
	'GENERAL_MANAGER',
	'ADMINISTRATOR',
] as const;

type UserRole = (typeof USER_ROLES)[number];

const userRoleEnum = createDomainEnum({
	code: 'enum.user_role.invalid_value',
	label: 'User role',
	values: USER_ROLES,
	normalize: (value) => value.trim().toUpperCase(),
});

const isUserRole = userRoleEnum.is;
const parseUserRole = userRoleEnum.parse;
const assertUserRole = userRoleEnum.assert;

export { USER_ROLES, assertUserRole, isUserRole, parseUserRole };
export type { UserRole };
