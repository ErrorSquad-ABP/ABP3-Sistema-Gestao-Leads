import { createDomainEnum } from './_shared/create-domain-enum.js';

const DEAL_STATUSES = ['OPEN', 'WON', 'LOST'] as const;

type DealStatus = (typeof DEAL_STATUSES)[number];

const dealStatusEnum = createDomainEnum({
	code: 'enum.deal_status.invalid_value',
	label: 'Deal status',
	values: DEAL_STATUSES,
	allowNormalization: false,
});

const isDealStatus = dealStatusEnum.is;
const isCanonicalDealStatus = dealStatusEnum.isCanonical;
const parseDealStatus = dealStatusEnum.parse;
const parseCanonicalDealStatus = dealStatusEnum.parseCanonical;
const assertDealStatus = dealStatusEnum.assert;
const assertCanonicalDealStatus = dealStatusEnum.assertCanonical;

export type { DealStatus };
export {
	assertCanonicalDealStatus,
	assertDealStatus,
	DEAL_STATUSES,
	isCanonicalDealStatus,
	isDealStatus,
	parseCanonicalDealStatus,
	parseDealStatus,
};
