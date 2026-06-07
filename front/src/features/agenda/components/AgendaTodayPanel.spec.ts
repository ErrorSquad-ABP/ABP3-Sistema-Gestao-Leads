import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AgendaTodayPanel, buildTodayOverview } from './AgendaTodayPanel';
import type { AgendaItem } from '../model/agenda.model';

const TODAY_ITEM: AgendaItem = {
	id: 'item-1',
	type: 'TASK',
	status: 'SCHEDULED',
	recurrence: 'NONE',
	title: 'Ligar cliente',
	description: null,
	location: null,
	startsAt: null,
	endsAt: null,
	dueAt: '2026-06-03T14:00:00.000Z',
	createdAt: '2026-06-01T10:00:00.000Z',
	updatedAt: '2026-06-01T10:00:00.000Z',
};

describe('AgendaTodayPanel', () => {
	it('builds today overview with overdue and next event data', () => {
		const overview = buildTodayOverview(
			[
				{
					...TODAY_ITEM,
					id: 'overdue-task',
					dueAt: '2026-06-03T08:00:00.000Z',
				},
				{
					...TODAY_ITEM,
					id: 'next-event',
					type: 'EVENT',
					startsAt: '2026-06-03T15:00:00.000Z',
					endsAt: '2026-06-03T16:00:00.000Z',
					dueAt: null,
				},
			],
			new Date('2026-06-03T12:00:00.000Z'),
		);

		assert.equal(overview.overdueItems.length, 1);
		assert.equal(overview.pendingTasks.length, 1);
		assert.equal(overview.nextEvent?.id, 'next-event');
	});

	it('renders operational today area', () => {
		const html = renderToStaticMarkup(
			createElement(AgendaTodayPanel, {
				items: [TODAY_ITEM],
				onCancel: noop,
				onComplete: noop,
				onEdit: noop,
			}),
		);

		assert.match(html, /Hoje/);
		assert.match(html, /Atrasadas/);
		assert.match(html, /Tarefas pendentes/);
	});
});

function noop() {
	return undefined;
}
