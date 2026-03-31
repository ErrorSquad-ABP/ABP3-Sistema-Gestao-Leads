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
	allowNormalization: false,
});

const isUserRole = userRoleEnum.is;
const isCanonicalUserRole = userRoleEnum.isCanonical;
const parseUserRole = userRoleEnum.parse;
const parseCanonicalUserRole = userRoleEnum.parseCanonical;
const assertUserRole = userRoleEnum.assert;
const assertCanonicalUserRole = userRoleEnum.assertCanonical;

export {
	USER_ROLES,
	assertCanonicalUserRole,
	assertUserRole,
	isCanonicalUserRole,
	isUserRole,
	parseCanonicalUserRole,
	parseUserRole,
};
export type { UserRole };
