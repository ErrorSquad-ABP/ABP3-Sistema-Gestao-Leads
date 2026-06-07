import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	parseAgendaItemResponse,
	parseAgendaItemsResponse,
} from './agenda.schema';

describe('agenda schema', () => {
	it('parses the internal agenda items contract', () => {
		const response = parseAgendaItemsResponse({
			items: [
				{
					id: 'item-1',
					type: 'EVENT',
					status: 'SCHEDULED',
					recurrence: 'NONE',
					title: 'Reunião',
					startsAt: '2026-06-01T12:00:00.000Z',
					endsAt: '2026-06-01T13:00:00.000Z',
					dueAt: null,
					createdAt: '2026-06-01T10:00:00.000Z',
					updatedAt: '2026-06-01T10:00:00.000Z',
				},
			],
		});

		assert.equal(response.items[0]?.id, 'item-1');
	});

	it('rejects incomplete agenda items', () => {
		assert.throws(() =>
			parseAgendaItemsResponse({
				items: [
					{
						id: 'item-1',
						type: 'EVENT',
						status: 'SCHEDULED',
						recurrence: 'NONE',
						title: 'Reunião',
					},
				],
			}),
		);
	});

	it('parses a task without due date', () => {
		const response = parseAgendaItemResponse({
			id: 'task-1',
			type: 'TASK',
			status: 'SCHEDULED',
			recurrence: 'WEEKLY',
			title: 'Ligar para cliente',
			dueAt: null,
			startsAt: null,
			endsAt: null,
			createdAt: '2026-06-01T10:00:00.000Z',
			updatedAt: '2026-06-01T10:00:00.000Z',
		});

		assert.equal(response.type, 'TASK');
		assert.equal(response.recurrence, 'WEEKLY');
	});
});
