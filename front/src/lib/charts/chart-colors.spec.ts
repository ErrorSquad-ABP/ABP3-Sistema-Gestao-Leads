import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	CHART_COLORS,
	SOURCE_BRAND_COLORS,
	chartSeriesColor,
	sourceBrandColor,
	statusBarColor,
	storePerformanceColor,
} from './chart-colors';

describe('chart color helpers', () => {
	it('returns the default bar token for status charts', () => {
		assert.equal(statusBarColor(), CHART_COLORS.barDefault);
	});

	it('normalizes source aliases without leaking raw colors', () => {
		assert.equal(sourceBrandColor('WHATSAPP'), SOURCE_BRAND_COLORS.whatsapp);
		assert.equal(
			sourceBrandColor('Mercado Livre'),
			SOURCE_BRAND_COLORS.mercadoLivre,
		);
		assert.equal(sourceBrandColor('digital_form'), SOURCE_BRAND_COLORS.website);
		assert.equal(sourceBrandColor('Visita em Loja'), SOURCE_BRAND_COLORS.store);
		assert.equal(sourceBrandColor('indicação'), SOURCE_BRAND_COLORS.indication);
	});

	it('falls back to neutral for unknown or invalid sources', () => {
		assert.equal(sourceBrandColor('outro canal'), CHART_COLORS.neutral);
		assert.equal(sourceBrandColor(null), CHART_COLORS.neutral);
	});

	it('uses sanitized store performance thresholds', () => {
		assert.equal(storePerformanceColor(0.24), CHART_COLORS.performanceBelow);
		assert.equal(storePerformanceColor(0.25), CHART_COLORS.performanceOk);
		assert.equal(
			storePerformanceColor(Number.NaN),
			CHART_COLORS.performanceBelow,
		);
		assert.equal(
			storePerformanceColor(0.1, Number.NaN),
			CHART_COLORS.performanceBelow,
		);
	});

	it('cycles chart series colors with safe indexes', () => {
		assert.equal(chartSeriesColor(-1), CHART_COLORS.barDefault);
		assert.equal(chartSeriesColor(Number.NaN), CHART_COLORS.barDefault);
		assert.equal(chartSeriesColor(5), CHART_COLORS.barDefault);
		assert.equal(chartSeriesColor(6), CHART_COLORS.barAlt);
	});
});
