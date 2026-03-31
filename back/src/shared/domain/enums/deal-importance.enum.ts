import { createDomainEnum } from './_shared/create-domain-enum.js';

const DEAL_IMPORTANCES = ['COLD', 'WARM', 'HOT'] as const;

type DealImportance = (typeof DEAL_IMPORTANCES)[number];

const dealImportanceEnum = createDomainEnum({
	code: 'enum.deal_importance.invalid_value',
	label: 'Deal importance',
	values: DEAL_IMPORTANCES,
	normalize: (value) => value.trim().toUpperCase(),
});

const isDealImportance = dealImportanceEnum.is;
const parseDealImportance = dealImportanceEnum.parse;
const assertDealImportance = dealImportanceEnum.assert;

export {
	DEAL_IMPORTANCES,
	assertDealImportance,
	isDealImportance,
	parseDealImportance,
};
export type { DealImportance };
