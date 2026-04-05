import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import type { PrismaService } from '../../../../shared/infrastructure/database/prisma/prisma.service.js';
import { buildListTeamLeadsWhere } from './list-team-leads.query.js';

type LeadWithRelations = Prisma.LeadGetPayload<{
	include: {
		customer: true;
		store: true;
		owner: {
			include: {
				team: true;
			};
		};
	};
}>;

type LeadDetailsView = {
	readonly id: string;
	readonly customerId: string;
	readonly storeId: string;
	readonly ownerUserId: string | null;
	readonly source: string;
	readonly status: string;
	readonly customer: {
		readonly id: string;
		readonly name: string;
		readonly email: string | null;
		readonly phone: string | null;
		readonly cpf: string | null;
	};
	readonly store: {
		readonly id: string;
		readonly name: string;
	};
	readonly owner: {
		readonly id: string;
		readonly name: string;
		readonly email: string;
		readonly role: string;
		readonly teamId: string | null;
		readonly team: {
			readonly id: string;
			readonly name: string;
		} | null;
	} | null;
};

@Injectable()
class LeadDetailsQuery {
	constructor(private readonly prisma: PrismaService) {}

	async findById(id: string): Promise<LeadDetailsView | null> {
		const lead = await this.prisma.lead.findUnique({
			where: { id },
			include: {
				customer: true,
				store: true,
				owner: {
					include: {
						team: true,
					},
				},
			},
		});

		return lead ? this.toView(lead) : null;
	}

	async listByOwner(ownerUserId: string): Promise<LeadDetailsView[]> {
		const leads = await this.prisma.lead.findMany({
			orderBy: { createdAt: 'desc' },
			where: { ownerUserId },
			include: {
				customer: true,
				store: true,
				owner: {
					include: {
						team: true,
					},
				},
			},
		});

		return leads.map((lead) => this.toView(lead));
	}

	async listByTeam(teamId: string): Promise<LeadDetailsView[]> {
		const leads = await this.prisma.lead.findMany({
			orderBy: { createdAt: 'desc' },
			where: buildListTeamLeadsWhere(teamId),
			include: {
				customer: true,
				store: true,
				owner: {
					include: {
						team: true,
					},
				},
			},
		});

		return leads.map((lead) => this.toView(lead));
	}

	private toView(lead: LeadWithRelations): LeadDetailsView {
		return {
			id: lead.id,
			customerId: lead.customerId,
			storeId: lead.storeId,
			ownerUserId: lead.ownerUserId,
			source: lead.source,
			status: lead.status,
			customer: {
				id: lead.customer.id,
				name: lead.customer.name,
				email: lead.customer.email,
				phone: lead.customer.phone,
				cpf: lead.customer.cpf,
			},
			store: {
				id: lead.store.id,
				name: lead.store.name,
			},
			owner:
				lead.owner === null
					? null
					: {
							id: lead.owner.id,
							name: lead.owner.name,
							email: lead.owner.email,
							role: lead.owner.role,
							teamId: lead.owner.teamId,
							team:
								lead.owner.team === null
									? null
									: {
											id: lead.owner.team.id,
											name: lead.owner.team.name,
										},
						},
		};
	}
}

export type { LeadDetailsView };
export { LeadDetailsQuery };
