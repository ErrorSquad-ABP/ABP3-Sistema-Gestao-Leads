import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import {
	BadRequestException,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common';

import { AgendaAccessPolicy } from '../services/agenda-access-policy.service.js';

import { CompleteAgendaItemUseCase } from './complete-agenda-item.use-case.js';
import { CancelAgendaItemUseCase } from './cancel-agenda-item.use-case.js';
import { DeleteAgendaItemUseCase } from './delete-agenda-item.use-case.js';
import { CreateAgendaItemUseCase } from './create-agenda-item.use-case.js';
import { GetAgendaMetricsUseCase } from './get-agenda-metrics.use-case.js';
import { isAgendaItemOverdue } from './agenda-item-validation.js';
import { ListAgendaItemsUseCase } from './list-agenda-items.use-case.js';
import { ListLeadAgendaItemsUseCase } from './list-lead-agenda-items.use-case.js';
import { UpdateAgendaItemUseCase } from './update-agenda-item.use-case.js';
import type {
	AgendaItem,
	AgendaItemRepository,
	CreateAgendaItemInput,
	UpdateAgendaItemInput,
} from '../../domain/agenda-item.types.js';

const BASE_ITEM: AgendaItem = {
	id: 'item-1',
	userId: 'user-1',
	leadId: null,
	lead: null,
	type: 'TASK',
	status: 'SCHEDULED',
	recurrence: 'NONE',
	title: 'Ligar para cliente',
	description: null,
	location: null,
	startsAt: null,
	endsAt: null,
	dueAt: null,
	createdAt: new Date('2026-06-01T10:00:00.000Z'),
	updatedAt: new Date('2026-06-01T10:00:00.000Z'),
};

const ACTOR = { userId: 'user-1', role: 'ATTENDANT' as const };
const ADMIN_ACTOR = { userId: 'admin-1', role: 'ADMINISTRATOR' as const };

function repository(overrides: Partial<AgendaItemRepository> = {}) {
	return {
		cancelForUser: mock.fn(async () => ({
			...BASE_ITEM,
			status: 'CANCELLED',
		})),
		deleteForUser: mock.fn(async () => true),
		completeTaskForUser: mock.fn(async () => ({
			...BASE_ITEM,
			status: 'DONE',
		})),
		create: mock.fn(async (input: CreateAgendaItemInput) => ({
			...BASE_ITEM,
			...input,
			id: 'created-item',
			createdAt: BASE_ITEM.createdAt,
			updatedAt: BASE_ITEM.updatedAt,
		})),
		findById: mock.fn(async () => BASE_ITEM),
		findByIdForUser: mock.fn(async () => BASE_ITEM),
		findLeadAccessSnapshot: mock.fn(async () => ({
			ownerUserId: 'user-1',
			storeId: 'store-1',
		})),
		getMetrics: mock.fn(async () => ({
			activitiesTodayCount: 1,
			completedThisMonthCount: 0,
			overdueCount: 0,
			pendingTasksCount: 1,
		})),
		list: mock.fn(async () => [BASE_ITEM]),
		update: mock.fn(async (input: UpdateAgendaItemInput) => ({
			...BASE_ITEM,
			...input,
			updatedAt: new Date('2026-06-01T11:00:00.000Z'),
		})),
		...overrides,
	} satisfies AgendaItemRepository;
}

function accessPolicy() {
	return new AgendaAccessPolicy();
}

describe('agenda item use cases', () => {
	it('lists only with the received authenticated user scope and safe default limit', async () => {
		const calls: unknown[] = [];
		const repo = repository({
			list: mock.fn(async (filters) => {
				calls.push(filters);
				return [BASE_ITEM];
			}),
		});
		const useCase = new ListAgendaItemsUseCase(repo, accessPolicy());

		await useCase.execute({ actor: ACTOR });

		const filters = calls[0] as { userId?: string; limit: number };
		assert.equal(filters.userId, 'user-1');
		assert.equal(filters.limit, 50);
	});

	it('lists all users for administrator without owner filter', async () => {
		const calls: unknown[] = [];
		const repo = repository({
			list: mock.fn(async (filters) => {
				calls.push(filters);
				return [BASE_ITEM];
			}),
		});
		const useCase = new ListAgendaItemsUseCase(repo, accessPolicy());

		await useCase.execute({ actor: ADMIN_ACTOR });

		const filters = calls[0] as { userId?: string; limit: number };
		assert.equal(filters.userId, undefined);
		assert.equal(filters.limit, 50);
	});

	it('rejects owner filter for non-administrator', async () => {
		const useCase = new ListAgendaItemsUseCase(repository(), accessPolicy());

		await assert.rejects(
			() =>
				useCase.execute({
					actor: ACTOR,
					ownerUserId: 'other-user',
				}),
			ForbiddenException,
		);
	});

	it('creates task with optional due date and trims text fields', async () => {
		const created: CreateAgendaItemInput[] = [];
		const repo = repository({
			create: mock.fn(async (input) => {
				created.push(input);
				return {
					...BASE_ITEM,
					...input,
					id: 'created-item',
					createdAt: BASE_ITEM.createdAt,
					updatedAt: BASE_ITEM.updatedAt,
				};
			}),
		});
		const useCase = new CreateAgendaItemUseCase(repo);

		const result = await useCase.execute({
			userId: 'user-1',
			type: 'TASK',
			title: '  Ligar para cliente  ',
			description: '  Confirmar proposta  ',
			location: '  Loja Centro  ',
			dueAt: new Date('2026-06-01T15:00:00.000Z'),
		});

		const createdInput = created[0];
		assert.ok(createdInput);
		assert.equal(result.id, 'created-item');
		assert.equal(createdInput.title, 'Ligar para cliente');
		assert.equal(createdInput.description, 'Confirmar proposta');
		assert.equal(createdInput.location, 'Loja Centro');
		assert.equal(createdInput.recurrence, 'NONE');
	});

	it('creates activity linked to an accessible lead', async () => {
		const created: CreateAgendaItemInput[] = [];
		const accessChecks: unknown[] = [];
		const repo = repository({
			create: mock.fn(async (input) => {
				created.push(input);
				return { ...BASE_ITEM, ...input, id: 'created-item' };
			}),
		});
		const policy = {
			assertCanReadLeadSnapshot: mock.fn(async (...args: unknown[]) => {
				accessChecks.push(args);
			}),
		};
		const useCase = new CreateAgendaItemUseCase(repo, policy as never);

		await useCase.execute({
			userId: 'user-1',
			userRole: 'ATTENDANT',
			type: 'TASK',
			title: 'Ligar cliente',
			leadId: 'lead-1',
			dueAt: new Date('2026-06-01T15:00:00.000Z'),
		});

		assert.equal(created[0]?.leadId, 'lead-1');
		assert.equal(accessChecks.length, 1);
	});

	it('rejects activity linked to an unknown lead', async () => {
		const useCase = new CreateAgendaItemUseCase(
			repository({ findLeadAccessSnapshot: mock.fn(async () => null) }),
			{ assertCanReadLeadSnapshot: mock.fn() } as never,
		);

		await assert.rejects(
			() =>
				useCase.execute({
					userId: 'user-1',
					userRole: 'ATTENDANT',
					type: 'TASK',
					title: 'Ligar cliente',
					leadId: 'lead-missing',
					dueAt: new Date('2026-06-01T15:00:00.000Z'),
				}),
			NotFoundException,
		);
	});

	it('creates events with simple recurrence values preserved', async () => {
		const created: CreateAgendaItemInput[] = [];
		const repo = repository({
			create: mock.fn(async (input) => {
				created.push(input);
				return {
					...BASE_ITEM,
					...input,
					id: 'created-item',
					createdAt: BASE_ITEM.createdAt,
					updatedAt: BASE_ITEM.updatedAt,
				};
			}),
		});
		const useCase = new CreateAgendaItemUseCase(repo);
		const recurrences = ['DAILY', 'WEEKLY', 'MONTHLY'] as const;

		for (const recurrence of recurrences) {
			await useCase.execute({
				userId: 'user-1',
				type: 'EVENT',
				title: `Reunião ${recurrence}`,
				startsAt: new Date('2026-06-01T12:00:00.000Z'),
				recurrence,
			});
		}

		assert.deepEqual(
			created.map((item) => item.recurrence),
			recurrences,
		);
	});

	it('returns agenda metrics from repository without formatting values', async () => {
		const repo = repository({
			getMetrics: mock.fn(async () => ({
				activitiesTodayCount: 2,
				completedThisMonthCount: 3,
				overdueCount: 1,
				pendingTasksCount: 4,
			})),
		});
		const useCase = new GetAgendaMetricsUseCase(repo, accessPolicy());

		const metrics = await useCase.execute(
			ACTOR,
			new Date('2026-06-03T12:00:00.000Z'),
		);

		assert.deepEqual(metrics, {
			activitiesTodayCount: 2,
			completedThisMonthCount: 3,
			overdueCount: 1,
			pendingTasksCount: 4,
		});
	});

	it('lists lead agenda items after validating lead access', async () => {
		const accessChecks: unknown[] = [];
		const repo = repository();
		const policy = {
			assertCanReadLeadSnapshot: mock.fn(async (...args: unknown[]) => {
				accessChecks.push(args);
			}),
		};
		const useCase = new ListLeadAgendaItemsUseCase(repo, policy as never);

		const result = await useCase.execute({
			actor: { userId: 'user-1', role: 'ATTENDANT' },
			leadId: 'lead-1',
			userId: 'user-1',
		});

		assert.equal(result.items.length, 1);
		assert.equal(accessChecks.length, 1);
	});

	it('rejects event creation without start date', async () => {
		const useCase = new CreateAgendaItemUseCase(repository());

		await assert.rejects(
			() =>
				useCase.execute({
					userId: 'user-1',
					type: 'EVENT',
					title: 'Reunião',
				}),
			BadRequestException,
		);
	});

	it('rejects event end before start on update', async () => {
		const useCase = new UpdateAgendaItemUseCase(
			repository({
				findById: mock.fn(
					async () =>
						({
							...BASE_ITEM,
							type: 'EVENT',
							startsAt: new Date('2026-06-01T12:00:00.000Z'),
						}) satisfies AgendaItem,
				),
			}),
			undefined,
			accessPolicy(),
		);

		await assert.rejects(
			() =>
				useCase.execute({
					id: 'item-1',
					actor: ACTOR,
					endsAt: new Date('2026-06-01T11:00:00.000Z'),
				}),
			BadRequestException,
		);
	});

	it('updates title, status and schedule for items owned by the current user', async () => {
		const updates: UpdateAgendaItemInput[] = [];
		const useCase = new UpdateAgendaItemUseCase(
			repository({
				update: mock.fn(async (input) => {
					updates.push(input);
					return {
						...BASE_ITEM,
						...input,
						updatedAt: new Date('2026-06-01T11:00:00.000Z'),
					};
				}),
			}),
			undefined,
			accessPolicy(),
		);

		const result = await useCase.execute({
			id: 'item-1',
			actor: ACTOR,
			title: '  Reunião remarcada  ',
			status: 'DONE',
			type: 'EVENT',
			startsAt: new Date('2026-06-01T14:00:00.000Z'),
			endsAt: new Date('2026-06-01T15:00:00.000Z'),
			dueAt: null,
		});

		assert.equal(result.title, 'Reunião remarcada');
		assert.equal(result.status, 'DONE');
		assert.equal(updates[0]?.title, 'Reunião remarcada');
		assert.equal(updates[0]?.type, 'EVENT');
	});

	it('rejects changing task to event without a start date', async () => {
		const useCase = new UpdateAgendaItemUseCase(
			repository(),
			undefined,
			accessPolicy(),
		);

		await assert.rejects(
			() =>
				useCase.execute({
					id: 'item-1',
					actor: ACTOR,
					type: 'EVENT',
				}),
			BadRequestException,
		);
	});

	it('does not update items outside the current user scope', async () => {
		const useCase = new UpdateAgendaItemUseCase(
			repository({
				findById: mock.fn(async () => ({
					...BASE_ITEM,
					userId: 'other-user',
				})),
			}),
			undefined,
			accessPolicy(),
		);

		await assert.rejects(
			() =>
				useCase.execute({
					id: 'item-1',
					actor: ACTOR,
					title: 'Outro título',
				}),
			ForbiddenException,
		);
	});

	it('detects overdue scheduled tasks and ignores completed tasks', () => {
		const now = new Date('2026-06-03T12:00:00.000Z');

		assert.equal(
			isAgendaItemOverdue(
				{
					...BASE_ITEM,
					type: 'TASK',
					status: 'SCHEDULED',
					dueAt: new Date('2026-06-03T10:00:00.000Z'),
				},
				now,
			),
			true,
		);
		assert.equal(
			isAgendaItemOverdue(
				{
					...BASE_ITEM,
					type: 'TASK',
					status: 'DONE',
					dueAt: new Date('2026-06-03T10:00:00.000Z'),
				},
				now,
			),
			false,
		);
	});

	it('detects overdue scheduled events using end date when present', () => {
		const now = new Date('2026-06-03T12:00:00.000Z');

		assert.equal(
			isAgendaItemOverdue(
				{
					...BASE_ITEM,
					type: 'EVENT',
					status: 'SCHEDULED',
					startsAt: new Date('2026-06-03T09:00:00.000Z'),
					endsAt: new Date('2026-06-03T10:00:00.000Z'),
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
					status: 'SCHEDULED',
					startsAt: new Date('2026-06-03T11:00:00.000Z'),
					endsAt: new Date('2026-06-03T13:00:00.000Z'),
				},
				now,
			),
			false,
		);
	});

	it('allows completing tasks', async () => {
		const useCase = new CompleteAgendaItemUseCase(repository(), accessPolicy());

		const result = await useCase.execute('item-1', ACTOR);

		assert.equal(result.status, 'DONE');
	});

	it('does not complete items outside the current user scope', async () => {
		const useCase = new CompleteAgendaItemUseCase(
			repository({
				findById: mock.fn(async () => ({
					...BASE_ITEM,
					userId: 'other-user',
				})),
			}),
			accessPolicy(),
		);

		await assert.rejects(
			() => useCase.execute('item-1', ACTOR),
			ForbiddenException,
		);
	});

	it('allows administrator to complete items from other users', async () => {
		const calls: [string, string][] = [];
		const useCase = new CompleteAgendaItemUseCase(
			repository({
				findById: mock.fn(async () => ({
					...BASE_ITEM,
					userId: 'other-user',
				})),
				completeTaskForUser: mock.fn(async (id, userId) => {
					calls.push([id, userId]);
					return { ...BASE_ITEM, status: 'DONE' as const };
				}),
			}),
			accessPolicy(),
		);

		await useCase.execute('item-1', ADMIN_ACTOR);

		assert.deepEqual(calls[0], ['item-1', 'other-user']);
	});

	it('cancels only items owned by the current user', async () => {
		const calls: [string, string][] = [];
		const repo = repository({
			cancelForUser: mock.fn(async (id, userId) => {
				calls.push([id, userId]);
				return {
					...BASE_ITEM,
					status: 'CANCELLED',
				} satisfies AgendaItem;
			}),
		});
		const useCase = new CancelAgendaItemUseCase(repo, accessPolicy());

		const result = await useCase.execute('item-1', ACTOR);

		assert.equal(result.status, 'CANCELLED');
		assert.deepEqual(calls[0], ['item-1', 'user-1']);
	});

	it('deletes only items owned by the current user', async () => {
		const calls: [string, string][] = [];
		const repo = repository({
			deleteForUser: mock.fn(async (id, userId) => {
				calls.push([id, userId]);
				return true;
			}),
		});
		const useCase = new DeleteAgendaItemUseCase(repo, accessPolicy());

		await useCase.execute('item-1', ACTOR);

		assert.deepEqual(calls[0], ['item-1', 'user-1']);
	});

	it('throws when deleting an item outside the current user scope', async () => {
		const useCase = new DeleteAgendaItemUseCase(
			repository({
				findById: mock.fn(async () => ({
					...BASE_ITEM,
					userId: 'other-user',
				})),
			}),
			accessPolicy(),
		);

		await assert.rejects(
			() => useCase.execute('item-1', ACTOR),
			ForbiddenException,
		);
	});
});
