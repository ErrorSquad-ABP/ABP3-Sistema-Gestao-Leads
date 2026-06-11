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
				onDelete: noop,
				onEdit: noop,
			}),
		);

		assert.match(html, /Reunião com cliente/);
		assert.match(html, /Compromisso/);
		assert.match(html, /aria-label="Editar atividade/);
		assert.match(html, /aria-label="Concluir atividade/);
		assert.match(html, /Loja Centro/);
		assert.match(html, /Alinhar proposta/);
		assert.doesNotMatch(html, /target="_blank"/);
		assert.doesNotMatch(html, /dangerouslySetInnerHTML/);
	});

	it('renders task and overdue badges', () => {
		const html = renderToStaticMarkup(
			createElement(AgendaEventCard, {
				item: {
					id: 'item-2',
					type: 'TASK',
					status: 'SCHEDULED',
					recurrence: 'NONE',
					title: 'Ligar cliente',
					startsAt: null,
					endsAt: null,
					dueAt: '2020-06-01T12:00:00.000Z',
					location: null,
					description: null,
					createdAt: '2020-06-01T10:00:00.000Z',
					updatedAt: '2020-06-01T10:00:00.000Z',
				},
				onCancel: noop,
				onComplete: noop,
				onDelete: noop,
				onEdit: noop,
			}),
		);

		assert.match(html, /Tarefa/);
		assert.match(html, /Atrasada/);
	});
});

function noop() {
	return undefined;
}
