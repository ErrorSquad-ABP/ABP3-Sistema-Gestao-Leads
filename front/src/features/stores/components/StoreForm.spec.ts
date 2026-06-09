import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	Children,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from 'react';

import {
	StoreFormDialog,
	emptyStoreFormValues,
	toStorePayload,
	type StoreFormValues,
} from './StoreForm';

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

function renderForm(values: StoreFormValues = emptyStoreFormValues): ReactNode {
	return StoreFormDialog({
		dialogError: null,
		dialogState: { mode: 'edit', store: null },
		isPending: false,
		onClose: () => undefined,
		onSave: () => undefined,
		onValueChange: () => undefined,
		values,
	});
}

describe('StoreFormDialog', () => {
	it('renders all editable store fields with existing values', () => {
		const values = {
			addressLine: 'Rua Centro, 100',
			city: 'Caçapava',
			coverage: 'Vale do Paraíba',
			distributionRegion: 'Sudeste',
			name: 'Loja Caçapava',
			region: 'Caçapava - SP',
			scope: 'Abrangência regional.',
			state: 'SP',
		};
		const tree = renderForm(values);
		const inputs = collectElements(
			tree,
			(element) => typeof element.props.id === 'string',
		);
		const inputValues = new Map(
			inputs.map((input) => [input.props.id, input.props.value]),
		);

		assert.equal(inputValues.get('store-name'), values.name);
		assert.equal(inputValues.get('store-address'), values.addressLine);
		assert.equal(inputValues.get('store-city'), values.city);
		assert.equal(inputValues.get('store-state'), values.state);
		assert.equal(inputValues.get('store-coverage'), values.coverage);
		assert.equal(inputValues.get('store-region'), values.region);
		assert.equal(
			inputValues.get('store-distribution-region'),
			values.distributionRegion,
		);
		assert.equal(inputValues.get('store-scope'), values.scope);
	});

	it('normalizes complete payloads and clears empty optional fields', () => {
		const payload = toStorePayload({
			addressLine: '  Rua Centro, 100 ',
			city: '',
			coverage: 'SP',
			distributionRegion: 'Sudeste',
			name: ' Loja Centro ',
			region: 'Centro - SP',
			scope: '',
			state: 'sp',
		});

		assert.deepEqual(payload, {
			addressLine: 'Rua Centro, 100',
			city: null,
			coverage: 'SP',
			distributionRegion: 'Sudeste',
			name: 'Loja Centro',
			region: 'Centro - SP',
			scope: null,
			state: 'SP',
		});
	});

	it('rejects missing name and invalid UF before submit', () => {
		assert.equal(
			toStorePayload({ ...emptyStoreFormValues, state: 'SP' }),
			null,
		);
		assert.equal(
			toStorePayload({
				...emptyStoreFormValues,
				name: 'Loja',
				state: 'Sao Paulo',
			}),
			null,
		);
	});
});
