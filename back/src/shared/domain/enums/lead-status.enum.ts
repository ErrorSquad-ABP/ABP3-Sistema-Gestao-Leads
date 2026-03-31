import { createDomainEnum } from './_shared/create-domain-enum.js';

const LEAD_STATUSES = [
	'NEW',
	'CONTACTED',
	'QUALIFIED',
	'DISQUALIFIED',
	'CONVERTED',
] as const;

type LeadStatus = (typeof LEAD_STATUSES)[number];

const leadStatusEnum = createDomainEnum({
	code: 'enum.lead_status.invalid_value',
	label: 'Lead status',
	values: LEAD_STATUSES,
	normalize: (value) => value.trim().toUpperCase(),
});

const isLeadStatus = leadStatusEnum.is;
const parseLeadStatus = leadStatusEnum.parse;
const assertLeadStatus = leadStatusEnum.assert;

export { LEAD_STATUSES, assertLeadStatus, isLeadStatus, parseLeadStatus };
export type { LeadStatus };
