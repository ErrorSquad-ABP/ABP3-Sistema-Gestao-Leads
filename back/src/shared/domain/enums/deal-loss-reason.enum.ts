import { createDomainEnum } from './_shared/create-domain-enum.js';

const DEAL_LOSS_REASONS = [
	'NO_INTEREST',
	'PRICE_EXPECTATION',
	'BOUGHT_ELSEWHERE',
	'NO_RESPONSE',
	'VEHICLE_UNAVAILABLE',
	'OTHER',
] as const;

type DealLossReason = (typeof DEAL_LOSS_REASONS)[number];

const dealLossReasonEnum = createDomainEnum({
	code: 'enum.deal_loss_reason.invalid_value',
	label: 'Deal loss reason',
	values: DEAL_LOSS_REASONS,
	allowNormalization: false,
});

const isDealLossReason = dealLossReasonEnum.is;
const isCanonicalDealLossReason = dealLossReasonEnum.isCanonical;
const parseDealLossReason = dealLossReasonEnum.parse;
const parseCanonicalDealLossReason = dealLossReasonEnum.parseCanonical;
const assertDealLossReason = dealLossReasonEnum.assert;
const assertCanonicalDealLossReason = dealLossReasonEnum.assertCanonical;

export type { DealLossReason };
export {
	assertCanonicalDealLossReason,
	assertDealLossReason,
	DEAL_LOSS_REASONS,
	isCanonicalDealLossReason,
	isDealLossReason,
	parseCanonicalDealLossReason,
	parseDealLossReason,
};
