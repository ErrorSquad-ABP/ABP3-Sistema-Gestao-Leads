import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import type { AuditAction } from '../../../../shared/domain/enums/audit-action.enum.js'
import { createAuditLogEntry } from '../../../../shared/infrastructure/database/audit/create-audit-log.js'
import { generateAuditDescription } from './create-audit-log-description.js'
// biome-ignore lint/style/useImportType: Nest DI
import { UserRepositoryFactory } from '../../../../modules/users/infrastructure/persistence/factories/user-repository.factory.js';
import { Uuid } from '../../../../shared/domain/types/identifiers.js';

interface AuditLogInput {
	readonly action: AuditAction;
	readonly actorUserId: string | null;
	readonly affectedId: string | null;
}

@Injectable()
class AuditLogService {
	constructor(
		private readonly userRepositoryFactory: UserRepositoryFactory,
	) {}

	async log(
		client: Prisma.TransactionClient,
		input: AuditLogInput,
	): Promise<void> {
		let description: string | null = null;

		if (input.actorUserId) {
			try {
				const users = this.userRepositoryFactory.create();
				const user = await users.findById(Uuid.parse(input.actorUserId));
				if (user) {
					description = generateAuditDescription({
						actorName: user.name.value,
						actorRole: user.role,
						action: input.action,
					});
				}
			} catch {
				description = null;
			}
		}

		await createAuditLogEntry(client, {
			action: input.action,
			actorUserId: input.actorUserId,
			affectedId: input.affectedId,
			description,
		});
	}
}

export type { AuditLogInput };
export { AuditLogService };