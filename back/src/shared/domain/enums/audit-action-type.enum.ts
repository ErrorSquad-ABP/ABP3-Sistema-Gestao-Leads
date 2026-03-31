import { createDomainEnum } from './_shared/create-domain-enum.js';

const AUDIT_ACTION_TYPES = [
	'LOGIN',
	'CREATE',
	'UPDATE',
	'DELETE',
	'STATUS_CHANGE',
	'STAGE_CHANGE',
] as const;

type AuditActionType = (typeof AUDIT_ACTION_TYPES)[number];

const auditActionTypeEnum = createDomainEnum({
	code: 'enum.audit_action_type.invalid_value',
	label: 'Audit action type',
	values: AUDIT_ACTION_TYPES,
	normalize: (value) => value.trim().toUpperCase(),
});

const isAuditActionType = auditActionTypeEnum.is;
const parseAuditActionType = auditActionTypeEnum.parse;
const assertAuditActionType = auditActionTypeEnum.assert;

export {
	AUDIT_ACTION_TYPES,
	assertAuditActionType,
	isAuditActionType,
	parseAuditActionType,
};
export type { AuditActionType };
