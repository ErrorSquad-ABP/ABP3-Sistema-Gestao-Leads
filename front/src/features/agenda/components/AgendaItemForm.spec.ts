import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AgendaItemForm } from './AgendaItemForm';

describe('AgendaItemForm', () => {
	it('renders edit mode with existing values and status field', () => {
		const html = renderToStaticMarkup(
			createElement(AgendaItemForm, {
				isSubmitting: false,
				item: {
					id: 'item-1',
					type: 'EVENT',
					status: 'SCHEDULED',
					recurrence: 'WEEKLY',
					title: 'Reunião com cliente',
					description: 'Revisar proposta',
					location: 'Loja Centro',
					startsAt: '2026-06-03T14:00:00.000Z',
					endsAt: '2026-06-03T15:00:00.000Z',
					dueAt: null,
					createdAt: '2026-06-01T10:00:00.000Z',
					updatedAt: '2026-06-01T10:00:00.000Z',
				},
				mode: 'edit',
				onCancel: noop,
				onSubmit: noop,
			}),
		);

		assert.match(html, /Status/);
		assert.match(html, /Reunião com cliente/);
		assert.match(html, /Revisar proposta/);
		assert.match(html, /Loja Centro/);
	});
});

function noop() {
	return undefined;
}
