import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import {
	Children,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from 'react';

import { StoresPageHeader } from './StoresHeaderMetrics';

type ElementProps = {
	readonly children?: ReactNode;
	readonly [key: string]: unknown;
};

function isElementWithProps(
	node: ReactNode,
): node is ReactElement<ElementProps> {
	return isValidElement<ElementProps>(node);
}

function textContent(node: ReactNode): string {
	if (typeof node === 'string' || typeof node === 'number') {
		return String(node);
	}
	if (!isElementWithProps(node)) {
		return Children.toArray(node).map(textContent).join('');
	}
	return textContent(node.props.children);
}

describe('Stores page layout', () => {
	it('keeps the stores list above analytics blocks', async () => {
		const source = await readFile(
			new URL('./StoresManagementScreen.tsx', import.meta.url),
			'utf8',
		);

		assert.ok(
			source.indexOf('<StoresCatalogCard') <
				source.indexOf('<StoresMetricsGrid'),
		);
		assert.ok(
			source.indexOf('<StoresCatalogCard') <
				source.indexOf('<StoresInsightsAside'),
		);
	});

	it('does not render store export controls in the page header', () => {
		const tree = StoresPageHeader({
			canManageStores: true,
			onCreate: () => undefined,
			onRegionFilterChange: () => undefined,
			onSearchChange: () => undefined,
			regionFilter: 'ALL',
			regionOptions: [],
			search: '',
		});

		assert.doesNotMatch(textContent(tree), /exportar|export/i);
	});
});
