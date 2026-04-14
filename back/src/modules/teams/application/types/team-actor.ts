import type { UserRole } from '../../../../shared/domain/enums/user-role.enum.js';

/** Identidade do utilizador que invoca casos de uso de equipes (JWT + escopo). */
type TeamActor = {
	readonly userId: string;
	readonly role: UserRole;
};

export type { TeamActor };
