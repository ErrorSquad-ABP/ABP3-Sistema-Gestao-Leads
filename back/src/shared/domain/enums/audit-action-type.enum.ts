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
	allowNormalization: false,
});

const isAuditActionType = auditActionTypeEnum.is;
const isCanonicalAuditActionType = auditActionTypeEnum.isCanonical;
const parseAuditActionType = auditActionTypeEnum.parse;
const parseCanonicalAuditActionType = auditActionTypeEnum.parseCanonical;
const assertAuditActionType = auditActionTypeEnum.assert;
const assertCanonicalAuditActionType = auditActionTypeEnum.assertCanonical;

export {
	AUDIT_ACTION_TYPES,
	assertCanonicalAuditActionType,
	assertAuditActionType,
	isCanonicalAuditActionType,
	isAuditActionType,
	parseCanonicalAuditActionType,
	parseAuditActionType,
};
export type { AuditActionType };
