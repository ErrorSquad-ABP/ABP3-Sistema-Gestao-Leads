import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { agendaDateKey, expandRecurringAgendaItems } from './agenda-formatters';
import type { AgendaItem } from '../model/agenda.model';

const BASE_ITEM: AgendaItem = {
	id: 'agenda-item-1',
	type: 'EVENT',
	status: 'SCHEDULED',
	recurrence: 'NONE',
	title: 'Reunião',
	description: null,
	location: null,
	startsAt: '2026-06-01T12:00:00.000Z',
	endsAt: '2026-06-01T13:00:00.000Z',
	dueAt: null,
	createdAt: '2026-06-01T10:00:00.000Z',
	updatedAt: '2026-06-01T10:00:00.000Z',
};

describe('agenda recurrence formatters', () => {
	it('expands daily items inside the visible range', () => {
		const items = expandRecurringAgendaItems(
			[{ ...BASE_ITEM, recurrence: 'DAILY' }],
			{
				from: '2026-06-03T00:00:00.000Z',
				to: '2026-06-05T23:59:59.999Z',
			},
		);

		assert.deepEqual(
			items.map((item) => agendaDateKey(item.startsAt)),
			['2026-06-03', '2026-06-04', '2026-06-05'],
		);
		assert.equal(items[0]?.endsAt, '2026-06-03T13:00:00.000Z');
	});

	it('expands weekly tasks without creating external data', () => {
		const items = expandRecurringAgendaItems(
			[
				{
					...BASE_ITEM,
					type: 'TASK',
					recurrence: 'WEEKLY',
					startsAt: null,
					endsAt: null,
					dueAt: '2026-06-01T12:00:00.000Z',
				},
			],
			{
				from: '2026-06-01T00:00:00.000Z',
				to: '2026-06-21T23:59:59.999Z',
			},
		);

		assert.deepEqual(
			items.map((item) => agendaDateKey(item.dueAt)),
			['2026-06-01', '2026-06-08', '2026-06-15'],
		);
	});

	it('keeps non recurring items only when they belong to the range', () => {
		const items = expandRecurringAgendaItems([BASE_ITEM], {
			from: '2026-06-02T00:00:00.000Z',
			to: '2026-06-30T23:59:59.999Z',
		});

		assert.equal(items.length, 0);
	});
});
