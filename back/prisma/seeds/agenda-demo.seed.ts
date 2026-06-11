import type {
	Prisma,
	PrismaClient,
} from '../../src/generated/prisma/client.js';
import type { DemoOrgDataset } from './demo-org.seed.js';
import { buildDemoOrg } from './demo-org.seed.js';
import { deterministicUuid } from './seed-utils.js';

type AgendaSeedLead = Readonly<{
	id: string;
	ownerUserId: string | null;
	vehicleInterestText: string | null;
}>;

type AgendaSeedUser = Readonly<{
	id: string;
	email: string;
}>;

type AgendaSeedItem = Prisma.AgendaItemCreateManyInput;

const AGENDA_TASK_TITLES = [
	'Retornar ligação do cliente',
	'Enviar proposta comercial',
	'Confirmar interesse no veículo',
	'Atualizar follow-up no CRM',
	'Solicitar documentação para financiamento',
	'Agendar test drive',
	'Revisar condições de troca',
	'Enviar fotos do veículo reservado',
	'Validar aprovação de crédito',
	'Registrar retorno pós-visita',
] as const;

const AGENDA_EVENT_TITLES = [
	'Test drive na loja',
	'Apresentação de condições comerciais',
	'Reunião com gerente comercial',
	'Visita ao showroom',
	'Entrega técnica do veículo',
	'Revisão de pipeline semanal',
] as const;

const AGENDA_LOCATIONS = [
	'Showroom principal',
	'Pátio de test drive',
	'Sala comercial',
	'Atendimento digital',
	'Loja Jacareí',
	'Loja São José dos Campos',
] as const;

function startOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);
	return next;
}

function atTime(base: Date, hours: number, minutes = 0) {
	const next = new Date(base);
	next.setHours(hours, minutes, 0, 0);
	return next;
}

function addDays(base: Date, days: number) {
	const next = new Date(base);
	next.setDate(next.getDate() + days);
	return next;
}

function buildAgendaDescription(
	title: string,
	vehicleInterestText: string | null,
) {
	if (vehicleInterestText) {
		return `${title} relacionado ao interesse em ${vehicleInterestText}.`;
	}
	return `${title} registrado pela equipe comercial.`;
}

function buildAgendaItemsForUser(
	user: AgendaSeedUser,
	leads: readonly AgendaSeedLead[],
	now: Date,
): AgendaSeedItem[] {
	const ownedLeads = leads.filter((lead) => lead.ownerUserId === user.id);
	const fallbackLeads = ownedLeads.length > 0 ? ownedLeads : leads.slice(0, 8);
	const today = startOfDay(now);
	const items: AgendaSeedItem[] = [];

	for (let index = 0; index < 12; index += 1) {
		const lead = fallbackLeads[index % fallbackLeads.length];
		const dayOffset = index - 2;
		const day = addDays(today, dayOffset);
		const isEvent = index % 3 === 0;
		const titlePool = isEvent ? AGENDA_EVENT_TITLES : AGENDA_TASK_TITLES;
		const title = titlePool[index % titlePool.length] ?? 'Atividade comercial';
		const startsAt = isEvent
			? atTime(day, 9 + (index % 6), (index * 15) % 60)
			: null;
		const endsAt =
			isEvent && startsAt
				? new Date(startsAt.getTime() + 60 * 60 * 1000)
				: null;
		const dueAt = isEvent
			? null
			: atTime(day, 10 + (index % 5), (index * 10) % 60);
		const status =
			dayOffset < -1
				? index % 4 === 0
					? 'DONE'
					: 'SCHEDULED'
				: index % 11 === 0
					? 'CANCELLED'
					: 'SCHEDULED';

		items.push({
			id: deterministicUuid(`demo-agenda:${user.email}:${index + 1}`),
			userId: user.id,
			leadId: lead?.id ?? null,
			type: isEvent ? 'EVENT' : 'TASK',
			status,
			recurrence: index === 5 ? 'WEEKLY' : 'NONE',
			title,
			description: buildAgendaDescription(
				title,
				lead?.vehicleInterestText ?? null,
			),
			location: AGENDA_LOCATIONS[index % AGENDA_LOCATIONS.length],
			startsAt,
			endsAt,
			dueAt,
			createdAt: addDays(day, -1),
			updatedAt: day,
		});
	}

	return items;
}

function buildDemoAgendaItems(
	demoOrg: DemoOrgDataset,
	leads: readonly AgendaSeedLead[],
	now = new Date(),
): AgendaSeedItem[] {
	const seedUsers = demoOrg.users.filter((user) =>
		['atendente@crm.com', 'gerente@crm.com', 'geral@crm.com'].includes(
			user.email,
		),
	);

	return seedUsers.flatMap((user) => buildAgendaItemsForUser(user, leads, now));
}

async function replaceAgendaItems(
	tx: Prisma.TransactionClient,
	items: readonly AgendaSeedItem[],
) {
	await tx.agendaItem.deleteMany();
	if (items.length === 0) {
		return;
	}
	await tx.agendaItem.createMany({ data: [...items] });
}

async function runAgendaDemoSeed(prisma: PrismaClient) {
	const demoOrg = await buildDemoOrg();
	const leads = await prisma.lead.findMany({
		select: {
			id: true,
			ownerUserId: true,
			vehicleInterestText: true,
		},
		orderBy: { createdAt: 'asc' },
		take: 40,
	});

	if (leads.length === 0) {
		throw new Error(
			'Nenhum lead encontrado. Execute o seed demo antes de popular a agenda.',
		);
	}

	const items = buildDemoAgendaItems(demoOrg, leads);
	await replaceAgendaItems(prisma, items);

	return {
		users: demoOrg.users.filter((user) =>
			['atendente@crm.com', 'gerente@crm.com', 'geral@crm.com'].includes(
				user.email,
			),
		).length,
		items: items.length,
	};
}

export { buildDemoAgendaItems, replaceAgendaItems, runAgendaDemoSeed };
