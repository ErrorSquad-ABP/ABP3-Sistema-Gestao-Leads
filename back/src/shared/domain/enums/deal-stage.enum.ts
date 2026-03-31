import { createDomainEnum } from './_shared/create-domain-enum.js';

const DEAL_STAGES = [
	'INITIAL_CONTACT',
	'NEGOTIATION',
	'PROPOSAL',
	'CLOSING',
] as const;

type DealStage = (typeof DEAL_STAGES)[number];

const dealStageEnum = createDomainEnum({
	code: 'enum.deal_stage.invalid_value',
	label: 'Deal stage',
	values: DEAL_STAGES,
	allowNormalization: false,
});

const isDealStage = dealStageEnum.is;
const isCanonicalDealStage = dealStageEnum.isCanonical;
const parseDealStage = dealStageEnum.parse;
const parseCanonicalDealStage = dealStageEnum.parseCanonical;
const assertDealStage = dealStageEnum.assert;
const assertCanonicalDealStage = dealStageEnum.assertCanonical;

export {
	DEAL_STAGES,
	assertCanonicalDealStage,
	assertDealStage,
	isCanonicalDealStage,
	isDealStage,
	parseCanonicalDealStage,
	parseDealStage,
};
export type { DealStage };
