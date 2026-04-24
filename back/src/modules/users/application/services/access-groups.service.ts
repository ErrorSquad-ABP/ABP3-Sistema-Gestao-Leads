import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import type { UserRole as PrismaUserRole } from '../../../../generated/prisma/enums.js';
// biome-ignore lint/style/useImportType: Nest precisa do valor da classe para metadata de injeção
import { PrismaService } from '../../../../shared/infrastructure/database/prisma/prisma.service.js';
import type { AccessGroupSummaryDto } from '../dto/access-group-summary.dto.js';

type CanonicalUserRole =
	| 'ATTENDANT'
	| 'MANAGER'
	| 'GENERAL_MANAGER'
	| 'ADMINISTRATOR';

type AccessGroupPayload = {
	readonly name: string;
	readonly description: string;
	readonly baseRole: CanonicalUserRole | null;
	readonly featureKeys: string[];
};

type PartialAccessGroupPayload = Partial<AccessGroupPayload>;

function toPrismaRole(role: CanonicalUserRole | null): PrismaUserRole | null {
	if (role === null) {
		return null;
	}

	switch (role) {
		case 'ADMINISTRATOR':
			return 'ADMIN';
		case 'ATTENDANT':
			return 'ATTENDANT';
		case 'GENERAL_MANAGER':
			return 'GENERAL_MANAGER';
		case 'MANAGER':
			return 'MANAGER';
	}
}

function toCanonicalRole(
	role: PrismaUserRole | null,
): CanonicalUserRole | null {
	if (role === null) {
		return null;
	}

	switch (role) {
		case 'ADMIN':
			return 'ADMINISTRATOR';
		case 'ATTENDANT':
			return 'ATTENDANT';
		case 'GENERAL_MANAGER':
			return 'GENERAL_MANAGER';
		case 'MANAGER':
			return 'MANAGER';
	}
}

@Injectable()
class AccessGroupsService {
	constructor(private readonly prisma: PrismaService) {}

	async list(): Promise<AccessGroupSummaryDto[]> {
		const rows = await this.prisma.accessGroup.findMany({
			orderBy: [{ isSystemGroup: 'desc' }, { createdAt: 'asc' }],
		});

		return rows.map((row) => this.toDto(row));
	}

	async create(payload: AccessGroupPayload): Promise<AccessGroupSummaryDto> {
		try {
			const created = await this.prisma.accessGroup.create({
				data: {
					name: payload.name,
					description: payload.description,
					baseRole: toPrismaRole(payload.baseRole),
					featureKeys: payload.featureKeys,
					isSystemGroup: false,
				},
			});

			return this.toDto(created);
		} catch (error) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'code' in error &&
				(error as { code?: string }).code === 'P2002'
			) {
				throw new ConflictException('Já existe um grupo com este nome.');
			}

			throw error;
		}
	}

	async update(
		id: string,
		payload: PartialAccessGroupPayload,
	): Promise<AccessGroupSummaryDto> {
		if (
			payload.name === undefined &&
			payload.description === undefined &&
			payload.baseRole === undefined &&
			payload.featureKeys === undefined
		) {
			throw new BadRequestException(
				'Informe ao menos um campo para atualizar o grupo de acesso.',
			);
		}

		const existing = await this.prisma.accessGroup.findUnique({
			where: { id },
		});
		if (!existing) {
			throw new NotFoundException('Grupo de acesso não encontrado.');
		}

		try {
			const updated = await this.prisma.accessGroup.update({
				where: { id },
				data: {
					name: payload.name,
					description: payload.description,
					baseRole:
						payload.baseRole !== undefined
							? toPrismaRole(payload.baseRole)
							: undefined,
					featureKeys: payload.featureKeys,
				},
			});

			return this.toDto(updated);
		} catch (error) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'code' in error &&
				(error as { code?: string }).code === 'P2002'
			) {
				throw new ConflictException('Já existe um grupo com este nome.');
			}

			throw error;
		}
	}

	async delete(id: string): Promise<void> {
		const existing = await this.prisma.accessGroup.findUnique({
			where: { id },
		});
		if (!existing) {
			throw new NotFoundException('Grupo de acesso não encontrado.');
		}

		if (existing.isSystemGroup) {
			throw new BadRequestException(
				'Grupos canônicos do sistema não podem ser removidos.',
			);
		}

		await this.prisma.accessGroup.delete({ where: { id } });
	}

	private toDto(row: {
		readonly id: string;
		readonly name: string;
		readonly description: string;
		readonly baseRole: PrismaUserRole | null;
		readonly featureKeys: unknown;
		readonly isSystemGroup: boolean;
	}): AccessGroupSummaryDto {
		return {
			id: row.id,
			name: row.name,
			description: row.description,
			baseRole: toCanonicalRole(row.baseRole),
			featureKeys: Array.isArray(row.featureKeys)
				? row.featureKeys.filter(
						(item): item is string => typeof item === 'string',
					)
				: [],
			isSystemGroup: row.isSystemGroup,
		};
	}
}

export { AccessGroupsService };
