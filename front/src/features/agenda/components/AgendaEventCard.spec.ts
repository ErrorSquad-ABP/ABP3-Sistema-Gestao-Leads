import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AgendaEventCard } from './AgendaEventCard';

describe('AgendaEventCard', () => {
	it('renders internal agenda item content as text', () => {
		const html = renderToStaticMarkup(
			createElement(AgendaEventCard, {
				item: {
					id: 'item-1',
					type: 'EVENT',
					status: 'SCHEDULED',
					recurrence: 'NONE',
					title: 'Reunião com cliente',
					startsAt: '2026-06-01T12:00:00.000Z',
					endsAt: '2026-06-01T13:00:00.000Z',
					dueAt: null,
					location: 'Loja Centro',
					description: 'Alinhar proposta',
					createdAt: '2026-06-01T10:00:00.000Z',
					updatedAt: '2026-06-01T10:00:00.000Z',
				},
				onCancel: noop,
				onComplete: noop,
			}),
		);

		assert.match(html, /Reunião com cliente/);
		assert.match(html, /Loja Centro/);
		assert.match(html, /Alinhar proposta/);
		assert.doesNotMatch(html, /target="_blank"/);
		assert.doesNotMatch(html, /dangerouslySetInnerHTML/);
	});
});

function noop() {
	return undefined;
}
