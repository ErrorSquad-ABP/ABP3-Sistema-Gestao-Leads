import { createDomainEnum } from './_shared/create-domain-enum.js';

const AUDIT_ACTIONS = [
	'USER_LOGIN',
	'CREATE_LEAD',
	'UPDATE_LEAD',
	'DELETE_LEAD',
	'CREATE_TEAM',
	'UPDATE_TEAM',
	'DELETE_TEAM',
	'CREATE_DEAL',
	'UPDATE_DEAL',
	'DELETE_DEAL',
	'CREATE_STORE',
	'UPDATE_STORE',
	'DELETE_STORE',
] as const;

type AuditAction = (typeof AUDIT_ACTIONS)[number];

const auditActionEnum = createDomainEnum({
	code: 'enum.audit_action.invalid_value',
	label: 'Audit action',
	values: AUDIT_ACTIONS,
	allowNormalization: false,
});

const isAuditAction = auditActionEnum.is;
const isCanonicalAuditAction = auditActionEnum.isCanonical;
const parseAuditAction = auditActionEnum.parse;
const parseCanonicalAuditAction = auditActionEnum.parseCanonical;
const assertAuditAction = auditActionEnum.assert;
const assertCanonicalAuditAction = auditActionEnum.assertCanonical;

export type { AuditAction };
export {
	AUDIT_ACTIONS,
	assertAuditAction,
	assertCanonicalAuditAction,
	isAuditAction,
	isCanonicalAuditAction,
	parseAuditAction,
	parseCanonicalAuditAction,
};