import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	agendaDateKey,
	expandRecurringAgendaItems,
	filterSelectedDayAgendaItems,
	isAgendaItemOverdue,
	moveAgendaItemToDate,
} from './agenda-formatters';
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

	it('hides scheduled items already finished on the selected current day', () => {
		const items = filterSelectedDayAgendaItems(
			[
				{
					...BASE_ITEM,
					id: 'past-event',
					startsAt: '2026-06-03T09:00:00.000Z',
					endsAt: '2026-06-03T10:00:00.000Z',
				},
				{
					...BASE_ITEM,
					id: 'ongoing-event',
					startsAt: '2026-06-03T23:00:00.000Z',
					endsAt: '2026-06-04T00:30:00.000Z',
				},
				{
					...BASE_ITEM,
					id: 'past-task',
					type: 'TASK',
					startsAt: null,
					endsAt: null,
					dueAt: '2026-06-03T08:00:00.000Z',
				},
			],
			new Date('2026-06-03T12:00:00.000Z'),
			new Date('2026-06-03T12:00:00.000Z'),
		);

		assert.deepEqual(
			items.map((item) => item.id),
			['ongoing-event'],
		);
	});

	it('keeps historical items when the selected day is not today', () => {
		const items = filterSelectedDayAgendaItems(
			[
				{
					...BASE_ITEM,
					id: 'historical-event',
					startsAt: '2026-06-02T09:00:00.000Z',
					endsAt: '2026-06-02T10:00:00.000Z',
				},
			],
			new Date('2026-06-02T12:00:00.000Z'),
			new Date('2026-06-03T12:00:00.000Z'),
		);

		assert.deepEqual(
			items.map((item) => item.id),
			['historical-event'],
		);
	});

	it('detects overdue tasks and events without flagging done or cancelled items', () => {
		const now = new Date('2026-06-03T12:00:00.000Z');

		assert.equal(
			isAgendaItemOverdue(
				{
					...BASE_ITEM,
					type: 'TASK',
					dueAt: '2026-06-03T11:00:00.000Z',
					startsAt: null,
					endsAt: null,
				},
				now,
			),
			true,
		);
		assert.equal(
			isAgendaItemOverdue(
				{
					...BASE_ITEM,
					type: 'EVENT',
					startsAt: '2026-06-03T09:00:00.000Z',
					endsAt: '2026-06-03T10:00:00.000Z',
				},
				now,
			),
			true,
		);
		assert.equal(
			isAgendaItemOverdue(
				{
					...BASE_ITEM,
					status: 'CANCELLED',
					startsAt: '2026-06-03T09:00:00.000Z',
					endsAt: '2026-06-03T10:00:00.000Z',
				},
				now,
			),
			false,
		);
	});

	it('moves tasks preserving the original due time', () => {
		const payload = moveAgendaItemToDate(
			{
				...BASE_ITEM,
				type: 'TASK',
				startsAt: null,
				endsAt: null,
				dueAt: '2026-06-03T13:30:00.000Z',
			},
			new Date(2026, 5, 10),
		);

		assert.equal(payload.startsAt, null);
		assert.equal(payload.endsAt, null);
		assert.equal(agendaDateKey(payload.dueAt), '2026-06-10');
	});

	it('moves events preserving their duration', () => {
		const payload = moveAgendaItemToDate(
			{
				...BASE_ITEM,
				type: 'EVENT',
				startsAt: '2026-06-03T14:00:00.000Z',
				endsAt: '2026-06-03T15:30:00.000Z',
				dueAt: null,
			},
			new Date(2026, 5, 10),
		);

		assert.equal(payload.dueAt, null);
		assert.equal(
			new Date(payload.endsAt ?? '').getTime() -
				new Date(payload.startsAt ?? '').getTime(),
			90 * 60 * 1000,
		);
	});
});
