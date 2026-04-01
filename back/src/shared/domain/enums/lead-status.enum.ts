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
	allowNormalization: false,
});

const isLeadStatus = leadStatusEnum.is;
const isCanonicalLeadStatus = leadStatusEnum.isCanonical;
const parseLeadStatus = leadStatusEnum.parse;
const parseCanonicalLeadStatus = leadStatusEnum.parseCanonical;
const assertLeadStatus = leadStatusEnum.assert;
const assertCanonicalLeadStatus = leadStatusEnum.assertCanonical;

export {
	LEAD_STATUSES,
	assertCanonicalLeadStatus,
	assertLeadStatus,
	isCanonicalLeadStatus,
	isLeadStatus,
	parseCanonicalLeadStatus,
	parseLeadStatus,
};
export type { LeadStatus };
