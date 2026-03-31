import { createDomainEnum } from './_shared/create-domain-enum.js';

const DEAL_IMPORTANCES = ['COLD', 'WARM', 'HOT'] as const;

type DealImportance = (typeof DEAL_IMPORTANCES)[number];

const dealImportanceEnum = createDomainEnum({
	code: 'enum.deal_importance.invalid_value',
	label: 'Deal importance',
	values: DEAL_IMPORTANCES,
	allowNormalization: false,
});

const isDealImportance = dealImportanceEnum.is;
const isCanonicalDealImportance = dealImportanceEnum.isCanonical;
const parseDealImportance = dealImportanceEnum.parse;
const parseCanonicalDealImportance = dealImportanceEnum.parseCanonical;
const assertDealImportance = dealImportanceEnum.assert;
const assertCanonicalDealImportance = dealImportanceEnum.assertCanonical;

export {
	DEAL_IMPORTANCES,
	assertCanonicalDealImportance,
	assertDealImportance,
	isCanonicalDealImportance,
	isDealImportance,
	parseCanonicalDealImportance,
	parseDealImportance,
};
export type { DealImportance };
