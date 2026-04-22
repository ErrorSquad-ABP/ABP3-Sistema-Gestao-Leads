import { createDomainEnum } from './_shared/create-domain-enum.js';

const TEMPORAL_FILTER_MODES = ['week', 'month', 'year', 'custom'] as const;

type TemporalFilterMode = (typeof TEMPORAL_FILTER_MODES)[number];

const temporalFilterModeEnum = createDomainEnum({
	code: 'enum.temporal_filter_mode.invalid_value',
	label: 'Temporal filter mode',
	values: TEMPORAL_FILTER_MODES,
	allowNormalization: false,
});

const isTemporalFilterMode = temporalFilterModeEnum.is;
const isCanonicalTemporalFilterMode = temporalFilterModeEnum.isCanonical;
const parseTemporalFilterMode = temporalFilterModeEnum.parse;
const parseCanonicalTemporalFilterMode = temporalFilterModeEnum.parseCanonical;
const assertTemporalFilterMode = temporalFilterModeEnum.assert;
const assertCanonicalTemporalFilterMode =
	temporalFilterModeEnum.assertCanonical;

export type { TemporalFilterMode };
export {
	assertCanonicalTemporalFilterMode,
	assertTemporalFilterMode,
	isCanonicalTemporalFilterMode,
	isTemporalFilterMode,
	parseCanonicalTemporalFilterMode,
	parseTemporalFilterMode,
	TEMPORAL_FILTER_MODES,
};
