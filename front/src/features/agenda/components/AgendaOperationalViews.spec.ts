import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { AgendaItem } from '../model/agenda.model';
import { buildAgendaReminders } from './AgendaRemindersPanel';
import { buildAgendaUpcomingGroups } from './AgendaUpcomingList';

const BASE_ITEM: AgendaItem = {
	id: 'agenda-item-1',
	type: 'EVENT',
	status: 'SCHEDULED',
	recurrence: 'NONE',
	title: 'Reunião',
	description: null,
	location: null,
	startsAt: '2026-06-03T14:00:00.000Z',
	endsAt: '2026-06-03T15:00:00.000Z',
	dueAt: null,
	createdAt: '2026-06-01T10:00:00.000Z',
	updatedAt: '2026-06-01T10:00:00.000Z',
};

describe('agenda operational views', () => {
	it('does not duplicate tomorrow items in the next seven days group', () => {
		const tomorrowItem: AgendaItem = {
			...BASE_ITEM,
			id: 'tomorrow',
			startsAt: '2026-06-04T18:00:00.000Z',
			endsAt: '2026-06-04T19:00:00.000Z',
		};

		const groups = buildAgendaUpcomingGroups(
			[tomorrowItem],
			new Date('2026-06-03T10:00:00.000Z'),
		);

		assert.deepEqual(
			groups.map((group) => [group.label, group.items.map((item) => item.id)]),
			[
				['Atrasadas', []],
				['Hoje', []],
				['Amanhã', ['tomorrow']],
				['Próximos 7 dias', []],
			],
		);
	});

	it('builds reminders for overdue items and near events only', () => {
		const reminders = buildAgendaReminders(
			[
				{
					...BASE_ITEM,
					id: 'overdue',
					startsAt: '2026-06-03T08:00:00.000Z',
					endsAt: '2026-06-03T09:00:00.000Z',
				},
				{
					...BASE_ITEM,
					id: 'near',
					startsAt: '2026-06-03T11:00:00.000Z',
					endsAt: '2026-06-03T12:00:00.000Z',
				},
				{
					...BASE_ITEM,
					id: 'later',
					startsAt: '2026-06-03T18:00:00.000Z',
					endsAt: '2026-06-03T19:00:00.000Z',
				},
			],
			new Date('2026-06-03T10:00:00.000Z'),
		);

		assert.deepEqual(
			reminders.map((item) => item.id),
			['overdue', 'near'],
		);
	});
});
