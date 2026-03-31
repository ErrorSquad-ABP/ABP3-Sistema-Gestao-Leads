import { createDomainEnum } from './_shared/create-domain-enum.js';

const DEAL_STATUSES = ['OPEN', 'WON', 'LOST'] as const;

type DealStatus = (typeof DEAL_STATUSES)[number];

const dealStatusEnum = createDomainEnum({
	code: 'enum.deal_status.invalid_value',
	label: 'Deal status',
	values: DEAL_STATUSES,
	normalize: (value) => value.trim().toUpperCase(),
});

const isDealStatus = dealStatusEnum.is;
const parseDealStatus = dealStatusEnum.parse;
const assertDealStatus = dealStatusEnum.assert;

export { DEAL_STATUSES, assertDealStatus, isDealStatus, parseDealStatus };
export type { DealStatus };
