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
	normalize: (value) => value.trim().toUpperCase(),
});

const isDealStage = dealStageEnum.is;
const parseDealStage = dealStageEnum.parse;
const assertDealStage = dealStageEnum.assert;

export { DEAL_STAGES, assertDealStage, isDealStage, parseDealStage };
export type { DealStage };
