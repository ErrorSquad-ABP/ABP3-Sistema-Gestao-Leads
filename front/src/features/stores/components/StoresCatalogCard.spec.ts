import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	Children,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from 'react';

import { TablePagination } from '@/components/data/TablePagination';

import type { StoreTableRow } from '../lib/store-view';
import { StoresCatalogCard } from './StoresCatalogCard';

type ElementProps = {
	readonly children?: ReactNode;
	readonly [key: string]: unknown;
};

function isElementWithProps(
	node: ReactNode,
): node is ReactElement<ElementProps> {
	return isValidElement<ElementProps>(node);
}

function collectElements(
	node: ReactNode,
	predicate: (element: ReactElement<ElementProps>) => boolean,
): ReactElement<ElementProps>[] {
	const elements: ReactElement<ElementProps>[] = [];

	function visit(current: ReactNode): void {
		for (const child of Children.toArray(current)) {
			if (!isElementWithProps(child)) {
				continue;
			}
			if (predicate(child)) {
				elements.push(child);
			}
			visit(child.props.children);
		}
	}

	visit(node);
	return elements;
}

function buildRow(index: number): StoreTableRow {
	return {
		addressLine: `Rua ${index}`,
		cityState: 'São Paulo, SP',
		convertedLeadCount: 0,
		conversionRate: 0,
		coverage: 'SP',
		distributionRegion: 'Sudeste',
		initials: 'LJ',
		leadCount: 0,
		openDealsCount: 0,
		ownerEmail: null,
		ownerInitials: 'NA',
		ownerName: 'Sem responsável',
		region: 'São Paulo - SP',
		scope: 'Abrangência regional.',
		state: 'SP',
		store: {
			id: `11111111-1111-4111-8111-${String(index).padStart(12, '0')}`,
			name: `Loja ${index}`,
		},
		teamCount: 1,
		wonValue: 0,
	};
}

describe('StoresCatalogCard pagination', () => {
	it('renders TablePagination controls and updates page/page size callbacks', () => {
		const pageChanges: number[] = [];
		const pageSizeChanges: number[] = [];
		const tree = StoresCatalogCard({
			canManageStores: true,
			errorMessage: null,
			filteredCount: 12,
			isError: false,
			isLoading: false,
			onDelete: () => undefined,
			onEdit: () => undefined,
			onPageChange: (page) => pageChanges.push(page),
			onPageSizeChange: (pageSize) => pageSizeChanges.push(pageSize),
			page: 1,
			pageSize: 5,
			rows: [buildRow(1), buildRow(2), buildRow(3), buildRow(4), buildRow(5)],
			totalPages: 3,
		});
		const pagination = collectElements(
			tree,
			(element) => element.type === TablePagination,
		).at(0);

		assert.ok(pagination);
		assert.equal(pagination.props.page, 1);
		assert.equal(pagination.props.pageSize, 5);
		assert.equal(pagination.props.totalItems, 12);
		assert.equal(pagination.props.totalPages, 3);
		(pagination.props.onPageChange as (page: number) => void)(2);
		(pagination.props.onPageSizeChange as (pageSize: number) => void)(10);

		assert.deepEqual(pageChanges, [2]);
		assert.deepEqual(pageSizeChanges, [10]);
	});
});
