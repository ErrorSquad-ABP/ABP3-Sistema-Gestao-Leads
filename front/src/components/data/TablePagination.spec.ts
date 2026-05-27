import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { buildPaginationItems } from './TablePagination';

describe('buildPaginationItems', () => {
	it('returns a safe first page when totalPages is zero', () => {
		assert.deepEqual(buildPaginationItems(1, 0), [1]);
	});

	it('returns a safe first page when totalPages is invalid', () => {
		assert.deepEqual(buildPaginationItems(1, Number.NaN), [1]);
		assert.deepEqual(buildPaginationItems(1, Number.POSITIVE_INFINITY), [1]);
		assert.deepEqual(buildPaginationItems(1, -3), [1]);
	});

	it('returns all pages when totalPages is at most five', () => {
		assert.deepEqual(buildPaginationItems(3, 5), [1, 2, 3, 4, 5]);
	});

	it('truncates decimal pages before building the range', () => {
		assert.deepEqual(buildPaginationItems(6.8, 10.9), [
			1,
			'ellipsis-start',
			5,
			6,
			7,
			'ellipsis-end',
			10,
		]);
	});

	it('keeps the first window visible near the beginning', () => {
		assert.deepEqual(buildPaginationItems(1, 10), [
			1,
			2,
			3,
			4,
			'ellipsis-end',
			10,
		]);
		assert.deepEqual(buildPaginationItems(4, 10), [
			1,
			2,
			3,
			4,
			'ellipsis-end',
			10,
		]);
	});

	it('shows both ellipses in the middle range', () => {
		assert.deepEqual(buildPaginationItems(6, 10), [
			1,
			'ellipsis-start',
			5,
			6,
			7,
			'ellipsis-end',
			10,
		]);
	});

	it('keeps boundary pages stable when one side is compact', () => {
		assert.deepEqual(buildPaginationItems(4, 6), [
			1,
			2,
			3,
			4,
			'ellipsis-end',
			6,
		]);
		assert.deepEqual(buildPaginationItems(5, 6), [
			1,
			'ellipsis-start',
			3,
			4,
			5,
			6,
		]);
	});

	it('keeps the last window visible near the end', () => {
		assert.deepEqual(buildPaginationItems(8, 10), [
			1,
			'ellipsis-start',
			7,
			8,
			9,
			10,
		]);
		assert.deepEqual(buildPaginationItems(10, 10), [
			1,
			'ellipsis-start',
			7,
			8,
			9,
			10,
		]);
	});

	it('clamps out-of-range current pages', () => {
		assert.deepEqual(buildPaginationItems(12, 10), [
			1,
			'ellipsis-start',
			7,
			8,
			9,
			10,
		]);
		assert.deepEqual(buildPaginationItems(0, 10), [
			1,
			2,
			3,
			4,
			'ellipsis-end',
			10,
		]);
	});
});
